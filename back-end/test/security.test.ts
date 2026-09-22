import type { ClientRequest, Server } from "node:http";
import type { BackendServices } from "../src/server.js";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { request as httpRequest } from "node:http";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { PROJECT_SLUGS } from "../src/projectCatalog.js";
import {
	createApp,
	parseBooleanFlag,
	parseHost,
	parsePort,
	parseTrustedProxies,
	validateProductionListener
} from "../src/server.js";
import {
	parseProjectAdminAuditContext,
	PROJECT_ADMIN_ACTOR_HEADER,
	PROJECT_ADMIN_REQUEST_ID_HEADER
} from "../src/utils/adminAudit.js";
import { canReadDiagnostics, validateDiagnosticsConfiguration } from "../src/utils/diagnostics.js";
import { resolveMongoConfiguration } from "../src/utils/mongoConfiguration.js";
import {
	canUseProjectAdmin,
	isLoopbackRemoteAddress,
	PROJECT_ADMIN_HEADER,
	validateProjectAdminConfiguration
} from "../src/utils/projectAdmin.js";
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
		listProjectVisibility: async () => [],
		pingDatabase: async () => undefined,
		setProjectVisibility: async mutation => ({
			slug: mutation.slug,
			updatedAt: "2026-08-27T00:00:00.000Z",
			visible: mutation.visible
		}),
		...overrides
	};
}

function adminHeaders(adminKey: string) {
	return {
		"content-type": "application/json",
		[PROJECT_ADMIN_ACTOR_HEADER]: "jacob",
		[PROJECT_ADMIN_HEADER]: adminKey,
		[PROJECT_ADMIN_REQUEST_ID_HEADER]: "0123456789abcdef0123456789abcdef"
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

async function withServer<T>(
	app: ReturnType<typeof createApp>,
	run: (baseUrl: string) => Promise<T>
): Promise<T> {
	const server = await listen(app);
	try {
		const address = server.address();
		if (!address || typeof address === "string") throw new Error("Expected a TCP listener.");
		return await run(`http://127.0.0.1:${address.port}`);
	}
	finally {
		server.closeAllConnections();
		await new Promise<void>(resolve => server.close(() => resolve()));
	}
}

async function waitFor(predicate: () => boolean, description: string): Promise<void> {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		if (predicate()) return;
		await new Promise(resolve => setImmediate(resolve));
	}
	throw new Error(`Timed out waiting for ${description}.`);
}

function startDisconnectableRequest(url: string): { closed: Promise<void>; request: ClientRequest } {
	let markClosed: (() => void) | undefined;
	const closed = new Promise<void>((resolve) => {
		markClosed = resolve;
	});
	const pendingRequest = httpRequest(url);
	pendingRequest.on("error", () => undefined);
	pendingRequest.on("response", response => response.resume());
	pendingRequest.once("close", () => markClosed?.());
	pendingRequest.end();
	return { closed, request: pendingRequest };
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

	it("coalesces concurrent readiness checks and caches the bounded result", async () => {
		let pingCalls = 0;
		let releasePing: (() => void) | undefined;
		const pingGate = new Promise<void>((resolve) => {
			releasePing = resolve;
		});
		const app = createApp({
			services: services({
				pingDatabase: async () => {
					pingCalls += 1;
					await pingGate;
				}
			})
		});

		await withServer(app, async (baseUrl) => {
			const requests = Array.from({ length: 20 }, () => fetch(`${baseUrl}/readyz`));
			await waitFor(() => pingCalls > 0, "the readiness probe");
			assert.equal(pingCalls, 1);
			releasePing?.();
			const responses = await Promise.all(requests);
			assert.deepEqual(responses.map(response => response.status), Array.from({ length: 20 }).fill(200));
			assert.equal((await fetch(`${baseUrl}/readyz`)).status, 200);
			assert.equal(pingCalls, 1);
		});
	});

	it("rejects excess database work immediately instead of building a queue", async () => {
		let activeCalls = 0;
		const releases: Array<() => void> = [];
		const app = createApp({
			services: services({
				listProjectVisibility: async () => {
					activeCalls += 1;
					await new Promise<void>(resolve => releases.push(resolve));
					return [];
				}
			})
		});

		await withServer(app, async (baseUrl) => {
			const admitted = Array.from({ length: 4 }, () => fetch(`${baseUrl}/api/projects/visibility`));
			await waitFor(() => activeCalls === 4, "all public database capacity slots");
			const rejected = await fetch(`${baseUrl}/api/projects/visibility`);
			assert.equal(rejected.status, 503);
			assert.equal(rejected.headers.get("retry-after"), "1");
			assert.deepEqual(await rejected.json(), { ok: false, error: "busy" });
			for (const release of releases) release();
			assert.deepEqual((await Promise.all(admitted)).map(response => response.status), [200, 200, 200, 200]);
		});
	});

	it("keeps database capacity leased until work settles after clients disconnect", async () => {
		let operationsStarted = 0;
		const releases: Array<() => void> = [];
		const app = createApp({
			services: services({
				listProjectVisibility: async () => {
					operationsStarted += 1;
					if (operationsStarted > 4) return [];
					await new Promise<void>(resolve => releases.push(resolve));
					return [];
				}
			})
		});

		await withServer(app, async (baseUrl) => {
			const disconnected = Array.from(
				{ length: 4 },
				() => startDisconnectableRequest(`${baseUrl}/api/projects/visibility`)
			);
			await waitFor(() => operationsStarted === 4, "all public database operations");
			for (const client of disconnected) client.request.destroy();
			await Promise.all(disconnected.map(client => client.closed));

			const rejected = await fetch(`${baseUrl}/api/projects/visibility`);
			assert.equal(rejected.status, 503);
			assert.equal(rejected.headers.get("retry-after"), "1");
			assert.deepEqual(await rejected.json(), { ok: false, error: "busy" });
			assert.equal(operationsStarted, 4);

			for (const release of releases) release();
		});
	});

	it("releases database capacity after protected work fails", async () => {
		let attempts = 0;
		const app = createApp({
			services: services({
				listProjectVisibility: async () => {
					attempts += 1;
					if (attempts === 1) throw new Error("synthetic database failure");
					return [];
				}
			})
		});

		await withServer(app, async (baseUrl) => {
			assert.equal((await fetch(`${baseUrl}/api/projects/visibility`)).status, 503);
			assert.equal((await fetch(`${baseUrl}/api/projects/visibility`)).status, 200);
			assert.equal(attempts, 2);
		});
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

	it("keeps retired accounts unavailable and project mutations disabled by default", async () => {
		const app = createApp({ services: services() });
		assert.equal((await request(app, "/accounts/me")).status, 404);
		assert.equal((await request(app, "/api/accounts/me")).status, 404);
		assert.equal((await request(app, "/api/readyz", { method: "POST" })).status, 404);
		for (let attempt = 0; attempt < 31; attempt++) {
			const disabledMutation = await request(app, "/api/admin/projects/oscre", {
				body: JSON.stringify({ visible: false }),
				headers: { "content-type": "application/json" },
				method: "PATCH"
			});
			assert.equal(disabledMutation.status, 404);
		}
	});

	it("publishes only bounded project visibility fields", async () => {
		const app = createApp({
			services: services({
				listProjectVisibility: async () => [{
					slug: "oscre",
					updatedAt: "2026-08-27T00:00:00.000Z",
					visible: false
				}]
			})
		});
		const response = await request(app, "/api/projects/visibility");

		assert.equal(response.status, 200);
		assert.deepEqual(await response.json(), { items: [{ slug: "oscre", visible: false }] });
		assert.equal(response.headers.get("cache-control"), "no-store");
		assert.equal(response.headers.get("set-cookie"), null);
	});

	it("fails closed when project visibility storage is unavailable", async () => {
		const app = createApp({
			services: services({
				listProjectVisibility: async () => {
					throw new Error("mongodb://user:password@private-host/portfolio");
				}
			})
		});
		const response = await request(app, "/api/projects/visibility");
		const body = JSON.stringify(await response.json());

		assert.equal(response.status, 503);
		assert.equal(body, "{\"ok\":false,\"error\":\"unavailable\"}");
		assert.doesNotMatch(body, /mongodb|password|private-host/);
	});

	it("requires the trusted proxy key for project visibility mutations", async () => {
		const adminKey = "a".repeat(32);
		let observedMutation: Parameters<BackendServices["setProjectVisibility"]>[0] | undefined;
		const app = createApp({
			projectAdminEnabled: true,
			projectAdminKey: adminKey,
			services: services({
				setProjectVisibility: async (mutation) => {
					observedMutation = mutation;
					return {
						slug: mutation.slug,
						updatedAt: "2026-08-27T00:00:00.000Z",
						visible: mutation.visible
					};
				}
			})
		});

		const missingKey = await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ visible: false }),
			headers: { "content-type": "application/json" },
			method: "PATCH"
		});
		assert.equal(missingKey.status, 403);

		const wrongKey = await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ visible: false }),
			headers: {
				"content-type": "application/json",
				[PROJECT_ADMIN_HEADER]: "b".repeat(32)
			},
			method: "PATCH"
		});
		assert.equal(wrongKey.status, 403);

		const missingAuditContext = await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ visible: false }),
			headers: {
				"content-type": "application/json",
				[PROJECT_ADMIN_HEADER]: adminKey
			},
			method: "PATCH"
		});
		assert.equal(missingAuditContext.status, 403);

		const authorized = await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ visible: false }),
			headers: adminHeaders(adminKey),
			method: "PATCH"
		});
		assert.equal(authorized.status, 200);
		assert.deepEqual(await authorized.json(), { slug: "oscre", visible: false });
		assert.equal(authorized.headers.get("set-cookie"), null);
		assert.deepEqual(observedMutation, {
			actor: "jacob",
			requestId: "0123456789abcdef0123456789abcdef",
			slug: "oscre",
			visible: false
		});
	});

	it("validates project mutation slugs and strict JSON bodies", async () => {
		const adminKey = "a".repeat(32);
		const app = createApp({
			projectAdminEnabled: true,
			projectAdminKey: adminKey,
			services: services()
		});
		const headers = adminHeaders(adminKey);

		assert.equal((await request(app, "/api/admin/projects/Bad_Slug", {
			body: JSON.stringify({ visible: false }),
			headers,
			method: "PATCH"
		})).status, 400);
		assert.equal((await request(app, "/api/admin/projects/not-in-the-catalog", {
			body: JSON.stringify({ visible: false }),
			headers,
			method: "PATCH"
		})).status, 400);
		assert.equal((await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ extra: true, visible: false }),
			headers,
			method: "PATCH"
		})).status, 400);
		assert.equal((await request(app, "/api/admin/projects/oscre", {
			body: "{",
			headers,
			method: "PATCH"
		})).status, 400);
		assert.equal((await request(app, "/api/admin/projects/oscre", {
			body: JSON.stringify({ padding: "x".repeat(3_000), visible: false }),
			headers,
			method: "PATCH"
		})).status, 413);
	});

	it("reserves administrative capacity only for validated mutation work", async () => {
		const adminKey = "a".repeat(32);
		let mutationCalls = 0;
		let releaseFirstMutation: (() => void) | undefined;
		const firstMutation = new Promise<void>((resolve) => {
			releaseFirstMutation = resolve;
		});
		const app = createApp({
			projectAdminEnabled: true,
			projectAdminKey: adminKey,
			services: services({
				setProjectVisibility: async (mutation) => {
					mutationCalls += 1;
					if (mutationCalls === 1) await firstMutation;
					return {
						slug: mutation.slug,
						updatedAt: "2026-08-27T00:00:00.000Z",
						visible: mutation.visible
					};
				}
			})
		});

		await withServer(app, async (baseUrl) => {
			const first = fetch(`${baseUrl}/api/admin/projects/oscre`, {
				body: JSON.stringify({ visible: false }),
				headers: adminHeaders(adminKey),
				method: "PATCH"
			});
			await waitFor(() => mutationCalls === 1, "the first administrative mutation");

			const invalid = await fetch(`${baseUrl}/api/admin/projects/not-in-the-catalog`, {
				body: JSON.stringify({ visible: false }),
				headers: adminHeaders(adminKey),
				method: "PATCH"
			});
			assert.equal(invalid.status, 400);

			const busy = await fetch(`${baseUrl}/api/admin/projects/oscre`, {
				body: JSON.stringify({ visible: true }),
				headers: {
					...adminHeaders(adminKey),
					[PROJECT_ADMIN_REQUEST_ID_HEADER]: "fedcba9876543210fedcba9876543210"
				},
				method: "PATCH"
			});
			assert.equal(busy.status, 503);
			assert.deepEqual(await busy.json(), { ok: false, error: "busy" });
			assert.equal(mutationCalls, 1);

			releaseFirstMutation?.();
			assert.equal((await first).status, 200);

			const retry = await fetch(`${baseUrl}/api/admin/projects/oscre`, {
				body: JSON.stringify({ visible: true }),
				headers: {
					...adminHeaders(adminKey),
					[PROJECT_ADMIN_REQUEST_ID_HEADER]: "00112233445566778899aabbccddeeff"
				},
				method: "PATCH"
			});
			assert.equal(retry.status, 200);
			assert.equal(mutationCalls, 2);
		});
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

	it("requires explicit strong project-admin keys and loopback delivery", () => {
		assert.doesNotThrow(() => validateProjectAdminConfiguration(false, undefined));
		assert.throws(() => validateProjectAdminConfiguration(true, undefined), /required/);
		assert.throws(() => validateProjectAdminConfiguration(true, "short"), /32 to 512/);
		assert.throws(() => validateProjectAdminConfiguration(true, `${"a".repeat(32)} `), /base64url/);
		assert.throws(() => validateProjectAdminConfiguration(true, `${"a".repeat(31)}!`), /base64url/);
		assert.doesNotThrow(() => validateProjectAdminConfiguration(true, "a".repeat(32)));
		assert.equal(canUseProjectAdmin({
			configuredKey: "a".repeat(32),
			enabled: true,
			providedKey: "a".repeat(32)
		}), true);
		assert.equal(canUseProjectAdmin({
			configuredKey: "a".repeat(32),
			enabled: true,
			providedKey: "b".repeat(32)
		}), false);
		assert.equal(isLoopbackRemoteAddress("127.0.0.1"), true);
		assert.equal(isLoopbackRemoteAddress("::ffff:127.0.0.1"), true);
		assert.equal(isLoopbackRemoteAddress("192.0.2.1"), false);
	});

	it("accepts only bounded semantic admin audit identities", () => {
		assert.deepEqual(
			parseProjectAdminAuditContext("jacob", "0123456789abcdef0123456789abcdef"),
			{ actor: "jacob", requestId: "0123456789abcdef0123456789abcdef" }
		);
		assert.equal(parseProjectAdminAuditContext("name with spaces", "0123456789abcdef"), null);
		assert.equal(parseProjectAdminAuditContext("jacob", "short"), null);
		assert.equal(parseProjectAdminAuditContext("a".repeat(81), "0123456789abcdef"), null);
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
		const vaultEnvironment = {
			VAULT_ROLE_ID: "role",
			VAULT_SECRET_ID: "secret"
		};
		const fallbackEnvironment = {
			MONGODB_URI: "mongodb://127.0.0.1:27017/portfolio",
			...vaultEnvironment
		};
		await assert.rejects(
			resolveMongoConfiguration(vaultEnvironment, async () => {
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
		await assert.rejects(
			resolveMongoConfiguration(fallbackEnvironment, async () => ({ uri: fallbackEnvironment.MONGODB_URI })),
			/exactly one MongoDB credential source/
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

	it("keeps the frontend and backend project catalogs identical", () => {
		const source = readFileSync(path.join(repositoryRoot, "front-end/src/data/otherProjects.ts"), "utf8");
		const frontendSlugs = [...source.matchAll(/^\s*slug:\s*"([a-z0-9-]+)",$/gm)].map(match => match[1]);
		assert.deepEqual(frontendSlugs, [...PROJECT_SLUGS]);
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
		const installer = readFileSync(path.join(repositoryRoot, "deploy/systemd/install-api-unit.sh"), "utf8");
		const extractor = readFileSync(
			path.join(repositoryRoot, "deploy/systemd/extract-runtime-artifact.py"),
			"utf8"
		);
		const nginx = readFileSync(
			path.join(repositoryRoot, "deploy/nginx/jacobdanderson.conf.example"),
			"utf8"
		);
		const nginxLocations = readFileSync(
			path.join(repositoryRoot, "deploy/nginx/jacobdanderson-api.locations.conf"),
			"utf8"
		);
		const nginxRateLimits = readFileSync(
			path.join(repositoryRoot, "deploy/nginx/jacobdanderson-rate-limits.conf.example"),
			"utf8"
		);

		assert.match(service, /WorkingDirectory=\/srv\/jacobdanderson\.net\/current/);
		assert.match(service, /ALLOW_PUBLIC_LISTENER=false/);
		assert.match(service, /TRUST_PROXY_IPS=loopback/);
		assert.match(service, /NODE_OPTIONS=--max-old-space-size=64/);
		assert.match(service, /MemoryHigh=128M/);
		assert.match(service, /MemoryMax=160M/);
		assert.match(service, /ReadOnlyPaths=-\/srv\/jacobdanderson\.net\/releases/);
		assert.match(prepare, /npm run artifact:build/);
		assert.match(prepare, /npm run artifact:smoke/);
		assert.doesNotMatch(prepare, /npm ci --omit=dev/);
		assert.match(promote, /root-installed runtime verifier/);
		assert.match(promote, /sha256sum/);
		assert.match(promote, /installed_extractor/);
		assert.match(extractor, /Archive contains a link or special file/);
		assert.match(promote, /restoring the verified previous release/i);
		assert.match(promote, /SITE_RESOLVE_IPV6/);
		assert.doesNotMatch(promote, /git -C/);
		assert.match(installer, /stat -c '%u:%g:%a'/);
		assert.match(installer, /jacobdanderson-promote-release/);
		assert.match(installer, /verify-runtime-artifact\.mjs/);
		assert.match(installer, /extract-runtime-artifact\.py/);
		assert.match(nginx, /listen \[::\]:443 ssl;/);
		assert.match(nginx, /http2 on;/);
		assert.match(nginx, /root \/srv\/jacobdanderson\.net\/current\/front-end\/dist/);
		assert.match(nginx, /location = \/admin/);
		assert.match(nginx, /auth_basic_user_file \/etc\/nginx\/jacobdanderson-admin\.htpasswd/);
		assert.match(nginx, /location = \/api\/projects\/visibility/);
		assert.match(nginx, /location \^~ \/api\/admin\/projects\//);
		assert.match(nginx, /include \/etc\/nginx\/snippets\/jacobdanderson-admin-secret\.conf/);
		assert.match(nginx, /proxy_set_header X-Portfolio-Admin-Key ""/);
		assert.match(nginx, /proxy_set_header X-Portfolio-Admin-Actor \$remote_user/);
		assert.match(nginx, /proxy_set_header X-Portfolio-Request-Id \$request_id/);
		assert.match(nginx, /proxy_set_header Authorization ""/);
		assert.ok(!nginx.includes("location ~ ^/(?:api/)?(?:healthz|readyz)$"));
		for (const probe of ["healthz", "readyz", "api/healthz", "api/readyz"]) {
			assert.match(nginx, new RegExp(`location = /${probe.replace("/", "\\/")} \\{`));
			assert.match(nginxLocations, new RegExp(`location = /${probe.replace("/", "\\/")} \\{`));
		}
		assert.match(nginx, /auth_delay 750ms/);
		assert.match(nginx, /limit_req zone=jacobdanderson_admin/);
		assert.match(nginxRateLimits, /zone=jacobdanderson_admin:1m rate=2r\/s/);
		const exactAdminLocation = nginx.match(/\tlocation = \/admin \{([\s\S]*?)\n\t\}/)?.[1];
		assert.ok(exactAdminLocation);
		assert.match(exactAdminLocation, /add_header Content-Security-Policy/);
		assert.match(exactAdminLocation, /add_header X-Robots-Tag "noindex, nofollow, noarchive"/);
	});

	it("logs only bounded error categories rather than arbitrary error-object content", () => {
		assert.equal(errorCategory(new TypeError("mongodb://user:secret@private-host")), "TypeError");
		assert.equal(errorCategory({ code: "ECONNREFUSED" }), "Error:ECONNREFUSED");
		assert.equal(errorCategory({ code: "secret=do-not-log" }), "UnknownError");
	});
});
