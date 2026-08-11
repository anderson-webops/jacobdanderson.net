import type { Server } from "node:http";
import type { BackendServices } from "../src/server.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	createApp,
	parseBooleanFlag,
	parseHost,
	parsePort,
	parseTrustedProxies,
	validateProductionListener
} from "../src/server.js";
import { canReadDiagnostics, validateDiagnosticsConfiguration } from "../src/utils/diagnostics.js";
import { resolveMongoConfiguration } from "../src/utils/mongoConfiguration.js";
import { errorCategory } from "../src/utils/safeLog.js";
import { validateVaultAddress, validateVaultCredentials } from "../src/vaultClient.js";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

function services(overrides: Partial<BackendServices> = {}): BackendServices {
	return {
		getDatabaseInfo: () => ({
			databaseName: "portfolio",
			host: "127.0.0.1",
			name: "portfolio",
			readyState: 1,
			usingVault: true
		}),
		getDatabaseState: () => 1,
		pingDatabase: async () => undefined,
		...overrides
	};
}

async function listen(app: ReturnType<typeof createApp>): Promise<Server> {
	return await new Promise((resolve, reject) => {
		const server = app.listen(0, "127.0.0.1");
		server.once("error", reject);
		server.once("listening", () => resolve(server));
	});
}

async function request(
	app: ReturnType<typeof createApp>,
	pathname: string,
	init?: RequestInit
): Promise<Response> {
	const server = await listen(app);
	try {
		const address = server.address();
		if (!address || typeof address === "string") throw new Error("Expected a TCP listener.");
		return await fetch(`http://127.0.0.1:${address.port}${pathname}`, init);
	}
	finally {
		await new Promise<void>(resolve => server.close(() => resolve()));
	}
}

describe("backend security boundaries", () => {
	it("serves only bounded health and readiness responses without framework fingerprinting", async () => {
		const app = createApp({ services: services() });
		const health = await request(app, "/api/healthz");
		assert.equal(health.status, 200);
		assert.deepEqual(await health.json(), { ok: true });
		assert.equal(health.headers.get("cache-control"), "no-store");
		assert.equal(health.headers.get("x-powered-by"), null);
		assert.equal(health.headers.get("x-content-type-options"), "nosniff");

		const ready = await request(app, "/api/readyz");
		assert.equal(ready.status, 200);
		assert.deepEqual(await ready.json(), { ok: true });
		assert.equal(ready.headers.get("set-cookie"), null);
		assert.equal(ready.headers.get("location"), null);
		assert.equal(ready.headers.get("www-authenticate"), null);

		const healthHead = await request(app, "/healthz", { method: "HEAD" });
		assert.equal(healthHead.status, 200);
		assert.equal(await healthHead.text(), "");
		assert.equal(healthHead.headers.get("cache-control"), "no-store");

		const readyHead = await request(app, "/readyz", { method: "HEAD" });
		assert.equal(readyHead.status, 200);
		assert.equal(await readyHead.text(), "");
	});

	it("returns generic readiness failures without database errors", async () => {
		const app = createApp({
			services: services({
				pingDatabase: async () => {
					throw new Error("mongodb://username:password@private-host/database");
				}
			})
		});
		const response = await request(app, "/api/readyz");
		assert.equal(response.status, 503);
		const body = JSON.stringify(await response.json());
		assert.doesNotMatch(body, /mongodb|password|private-host/);
		assert.equal(body, "{\"ok\":false}");
	});

	it("keeps diagnostics disabled by default and never trusts loopback alone", async () => {
		const key = "d".repeat(32);
		const disabled = await request(createApp({ services: services() }), "/_dbinfo");
		assert.equal(disabled.status, 404);

		const enabledApp = createApp({
			diagnosticsEnabled: true,
			diagnosticsKey: key,
			services: services()
		});
		const unauthorized = await request(enabledApp, "/_dbinfo");
		assert.equal(unauthorized.status, 403);
		const authorized = await request(enabledApp, "/_dbinfo", {
			headers: { "x-internal-diagnostics-key": key }
		});
		assert.equal(authorized.status, 200);
		assert.equal((await authorized.json() as { databaseName: string }).databaseName, "portfolio");
	});

	it("does not expose the retired account or mutation surface", async () => {
		const app = createApp({ services: services() });
		assert.equal((await request(app, "/accounts/me")).status, 404);
		assert.equal((await request(app, "/api/accounts/me")).status, 404);
		assert.equal((await request(app, "/api/readyz", { method: "POST" })).status, 404);
	});

	it("requires explicit strong diagnostic keys and uses timing-safe matching", () => {
		assert.throws(() => validateDiagnosticsConfiguration(true, "short"), /32 to 512/);
		assert.throws(() => validateDiagnosticsConfiguration(true, "x".repeat(513)), /32 to 512/);
		assert.equal(
			canReadDiagnostics({
				configuredKey: "a".repeat(32),
				enabled: true,
				providedKey: "a".repeat(32)
			}),
			true
		);
		assert.equal(
			canReadDiagnostics({
				configuredKey: "a".repeat(32),
				enabled: true,
				providedKey: "b".repeat(32)
			}),
			false
		);
	});

	it("accepts only exact proxy addresses and validated listener values", () => {
		assert.deepEqual(parseTrustedProxies("loopback,192.0.2.10"), ["127.0.0.1", "::1", "192.0.2.10"]);
		assert.throws(() => parseTrustedProxies("*"), /exact IP/);
		assert.throws(() => parseTrustedProxies("1"), /exact IP/);
		assert.equal(parseHost(undefined), "127.0.0.1");
		assert.throws(() => parseHost("bad host"), /valid hostname/);
		assert.throws(() => parseHost("-bad.example"), /valid hostname/);
		assert.equal(parsePort("3003"), 3003);
		assert.throws(() => parsePort("0"), /1 through 65535/);
		assert.equal(parseBooleanFlag(undefined, "FLAG"), false);
		assert.equal(parseBooleanFlag("true", "FLAG"), true);
		assert.throws(() => parseBooleanFlag("yes", "FLAG"), /true or false/);
		assert.doesNotThrow(() => validateProductionListener("127.0.0.1", true, false));
		assert.throws(
			() => validateProductionListener("0.0.0.0", true, false),
			/exact loopback IP/
		);
		assert.doesNotThrow(() => validateProductionListener("0.0.0.0", true, true));
	});

	it("fails closed on partial or failed Vault configuration", async () => {
		const fallbackEnvironment = {
			MONGODB_URI: "mongodb://127.0.0.1:27017/portfolio",
			VAULT_ROLE_ID: "role",
			VAULT_SECRET_ID: "secret"
		};
		await assert.rejects(
			resolveMongoConfiguration(fallbackEnvironment, async () => {
				throw new Error("Vault unavailable");
			}),
			/Vault unavailable/
		);
		await assert.rejects(
			resolveMongoConfiguration({
				MONGODB_URI: fallbackEnvironment.MONGODB_URI,
				VAULT_ROLE_ID: "role"
			}),
			/configured together/
		);
		assert.deepEqual(
			await resolveMongoConfiguration({
				MONGODB_URI: fallbackEnvironment.MONGODB_URI
			}),
			{
				source: "env",
				uri: fallbackEnvironment.MONGODB_URI
			}
		);
	});

	it("requires HTTPS for non-loopback Vault origins", () => {
		assert.equal(validateVaultAddress({ VAULT_ADDR: "http://127.0.0.1:8200" }).origin, "http://127.0.0.1:8200");
		assert.throws(
			() => validateVaultAddress({ VAULT_ADDR: "http://vault.example.com" }),
			/must use HTTPS/
		);
		assert.throws(
			() => validateVaultAddress({ VAULT_ADDR: "https://user:pass@vault.example.com" }),
			/without embedded credentials/
		);
		assert.throws(
			() => validateVaultAddress({ VAULT_ADDR: `https://${"a".repeat(2_048)}` }),
			/at most 2048/
		);
		assert.throws(
			() => validateVaultCredentials({
				VAULT_ROLE_ID: "r".repeat(4_097),
				VAULT_SECRET_ID: "secret"
			}),
			/VAULT_ROLE_ID must be at most 4096/
		);
	});

	it("bounds MongoDB configuration before connecting", async () => {
		await assert.rejects(
			resolveMongoConfiguration({ MONGODB_URI: `mongodb://${"a".repeat(8_192)}` }),
			/valid MongoDB URI/
		);
		await assert.rejects(
			resolveMongoConfiguration({ MONGODB_URI: "mongodb://host/database\ninvalid" }),
			/valid MongoDB URI/
		);
	});

	it("ships an atomic direct deployment contract without production Docker", () => {
		assert.equal(existsSync(path.join(repositoryRoot, "Dockerfile")), false);
		assert.equal(existsSync(path.join(repositoryRoot, ".dockerignore")), false);
		assert.equal(existsSync(path.join(repositoryRoot, "nginx.conf")), false);

		const service = readFileSync(
			path.join(repositoryRoot, "deploy/systemd/jacobdanderson-api.service"),
			"utf8"
		);
		const prepare = readFileSync(path.join(repositoryRoot, "deploy/systemd/prepare-release.sh"), "utf8");
		const promote = readFileSync(path.join(repositoryRoot, "deploy/systemd/promote-release.sh"), "utf8");
		const nginx = readFileSync(
			path.join(repositoryRoot, "deploy/nginx/jacobdanderson.conf.example"),
			"utf8"
		);

		assert.match(service, /WorkingDirectory=\/srv\/jacobdanderson\.net\/current/);
		assert.match(service, /ALLOW_PUBLIC_LISTENER=false/);
		assert.match(prepare, /npm ci --omit=dev --include=optional --ignore-scripts/);
		assert.match(promote, /restoring the previous release/i);
		assert.match(promote, /SITE_RESOLVE_IPV6/);
		assert.match(nginx, /listen \[::\]:443 ssl http2/);
		assert.match(nginx, /root \/srv\/jacobdanderson\.net\/current\/front-end\/dist/);
	});

	it("logs only bounded error categories rather than arbitrary error-object content", () => {
		assert.equal(errorCategory(new TypeError("mongodb://user:secret@private-host")), "TypeError");
		assert.equal(errorCategory({ code: "ECONNREFUSED" }), "Error:ECONNREFUSED");
		assert.equal(errorCategory({ code: "secret=do-not-log" }), "UnknownError");
	});
});
