import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const sourceArtifact = await realpath(
	process.env.RUNTIME_ARTIFACT_ROOT
		? path.resolve(process.env.RUNTIME_ARTIFACT_ROOT)
		: path.join(root, ".runtime-artifact")
);
const sourceVerifier = path.join(root, "scripts/verify-runtime-artifact.mjs");

function cleanEnvironment(overrides = {}) {
	return {
		HOME: process.env.HOME || "",
		LANG: "C.UTF-8",
		PATH: process.env.PATH || "",
		...overrides
	};
}

function runSync(command, args, options = {}) {
	const result = spawnSync(command, args, {
		encoding: "utf8",
		maxBuffer: 20 * 1024 * 1024,
		...options
	});
	if (result.error) throw result.error;
	return { ...result, output: `${result.stdout || ""}${result.stderr || ""}` };
}

async function ephemeralPort() {
	return await new Promise((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const address = server.address();
			const port = typeof address === "object" && address ? address.port : 0;
			server.close(() => port ? resolve(port) : reject(new Error("Could not allocate a loopback port.")));
		});
	});
}

function startService(entrypoint, cwd, environment) {
	const child = spawn(process.execPath, [entrypoint], {
		cwd,
		detached: process.platform !== "win32",
		env: environment,
		stdio: ["ignore", "pipe", "pipe"]
	});
	let output = "";
	for (const stream of [child.stdout, child.stderr]) {
		stream.on("data", (data) => {
			output += data.toString();
			if (output.length > 100_000) output = output.slice(-100_000);
		});
	}
	return { child, output: () => output };
}

function running(child) {
	return child.exitCode === null && child.signalCode === null;
}

async function waitForExit(child, timeoutMs) {
	if (!running(child)) return true;
	return await new Promise((resolve) => {
		let timer;
		const onExit = () => {
			clearTimeout(timer);
			resolve(true);
		};
		timer = setTimeout(() => {
			child.off("exit", onExit);
			resolve(false);
		}, timeoutMs);
		child.once("exit", onExit);
	});
}

async function stopService(service) {
	if (!running(service.child) || !service.child.pid) return;
	const target = process.platform === "win32" ? service.child.pid : -service.child.pid;
	process.kill(target, "SIGTERM");
	if (await waitForExit(service.child, 10_000)) return;
	process.kill(target, "SIGKILL");
	await waitForExit(service.child, 2_000);
}

async function waitForResponse(service, url, expectedStatus = 200, timeoutMs = 20_000) {
	const started = Date.now();
	let lastError;
	while (Date.now() - started < timeoutMs) {
		if (!running(service.child)) {
			throw new Error(`Service exited before ${url} became ready.\n${service.output()}`);
		}
		try {
			const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
			if (response.status === expectedStatus) return response;
			lastError = new Error(`${url} returned ${response.status}.`);
		}
		catch (error) {
			lastError = error;
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error(`Timed out waiting for ${url}: ${String(lastError)}`);
}

function databaseUri(baseUri) {
	const queryIndex = baseUri.indexOf("?");
	const query = queryIndex >= 0 ? baseUri.slice(queryIndex) : "";
	const base = queryIndex >= 0 ? baseUri.slice(0, queryIndex) : baseUri;
	const authorityStart = base.indexOf("://") + 3;
	const pathStart = base.indexOf("/", authorityStart);
	const prefix = pathStart >= 0 ? base.slice(0, pathStart) : base;
	return `${prefix}/jacob_artifact_${process.pid}_${Date.now()}${query}`;
}

const acceptanceRoot = await mkdtemp(path.join(os.tmpdir(), "jacobdanderson-runtime-acceptance-"));
const artifactRoot = path.join(acceptanceRoot, "artifact");
const verifier = path.join(acceptanceRoot, "verify-runtime-artifact.mjs");
let databaseClient;

try {
	await Promise.all([
		cp(sourceArtifact, artifactRoot, { recursive: true }),
		cp(sourceVerifier, verifier)
	]);
	const manifest = JSON.parse(await readFile(path.join(artifactRoot, ".runtime-manifest.json"), "utf8"));
	const expectedCommit = process.env.RUNTIME_ARTIFACT_EXPECT_COMMIT || manifest.source.commit;
	const requireClean = process.env.RUNTIME_ARTIFACT_REQUIRE_CLEAN || "false";
	const verification = runSync(process.execPath, [verifier, artifactRoot], {
		cwd: acceptanceRoot,
		env: cleanEnvironment({
			RUNTIME_ARTIFACT_EXPECT_COMMIT: expectedCommit,
			RUNTIME_ARTIFACT_REQUIRE_CLEAN: requireClean
		})
	});
	assert.equal(verification.status, 0, verification.output);
	assert.match(await readFile(path.join(artifactRoot, "front-end/dist/index.html"), "utf8"), /<html/iu);

	const missingConfiguration = runSync(
		process.execPath,
		[path.join(artifactRoot, "back-end/dist/server.js")],
		{ cwd: artifactRoot, env: cleanEnvironment({ NODE_ENV: "production" }), timeout: 10_000 }
	);
	assert.equal(missingConfiguration.status, 1, missingConfiguration.output);
	assert.match(missingConfiguration.output, /Backend startup failed: Error/u);
	assert.doesNotMatch(missingConfiguration.output, /mongodb(?:\+srv)?:\/\/|password|secret=/iu);

	const suppliedMongoUri = process.env.RUNTIME_ARTIFACT_MONGO_URI;
	if (!suppliedMongoUri) {
		if (process.env.RUNTIME_ARTIFACT_REQUIRE_MONGO === "true") {
			throw new Error("RUNTIME_ARTIFACT_MONGO_URI is required for exact dependency-ready acceptance.");
		}
		process.stdout.write("Synthetic MongoDB URI not supplied; dependency-ready artifact acceptance was skipped.\n");
	}
	else {
		const mongoUri = databaseUri(suppliedMongoUri);
		const mongodbModule = await import(pathToFileURL(
			path.join(artifactRoot, "back-end/node_modules/mongodb/lib/index.js")
		).href);
		const MongoClient = mongodbModule.MongoClient || mongodbModule.default?.MongoClient;
		assert.ok(MongoClient, "Artifact MongoDB driver did not export MongoClient.");
		databaseClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5_000 });
		await databaseClient.connect();
		await databaseClient.db().dropDatabase();

		const apiPort = await ephemeralPort();
		const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
		const adminKey = "artifact-admin-key-0123456789abcdef";
		const requestId = "0123456789abcdef0123456789abcdef";
		const api = startService(
			path.join(artifactRoot, "back-end/dist/server.js"),
			artifactRoot,
			cleanEnvironment({
				ALLOW_PUBLIC_LISTENER: "false",
				ENABLE_INTERNAL_DIAGNOSTICS: "false",
				ENABLE_PROJECT_ADMIN: "true",
				HOST: "127.0.0.1",
				MONGODB_URI: mongoUri,
				NODE_ENV: "production",
				PORT: String(apiPort),
				PROJECT_ADMIN_PROXY_KEY: adminKey,
				TRUST_PROXY_IPS: "loopback"
			})
		);
		try {
			await waitForResponse(api, `${apiBaseUrl}/readyz`);
			for (const pathname of ["/healthz", "/readyz"]) {
				const response = await fetch(`${apiBaseUrl}${pathname}`);
				assert.equal(response.status, 200);
				assert.deepEqual(await response.json(), { ok: true });
				assert.equal(response.headers.get("cache-control"), "no-store");
				assert.equal(response.headers.get("set-cookie"), null);
				assert.equal(response.headers.get("location"), null);
				assert.equal((await fetch(`${apiBaseUrl}${pathname}`, { method: "HEAD" })).status, 200);
			}
			const mutation = await fetch(`${apiBaseUrl}/api/admin/projects/oscre`, {
				body: JSON.stringify({ visible: false }),
				headers: {
					"Content-Type": "application/json",
					"X-Portfolio-Admin-Actor": "artifact-test",
					"X-Portfolio-Admin-Key": adminKey,
					"X-Portfolio-Request-Id": requestId
				},
				method: "PATCH"
			});
			assert.equal(mutation.status, 200);
			assert.deepEqual(await mutation.json(), { slug: "oscre", visible: false });
			const visibility = await fetch(`${apiBaseUrl}/api/projects/visibility`);
			assert.equal(visibility.status, 200);
			assert.deepEqual(await visibility.json(), { items: [{ slug: "oscre", visible: false }] });

			const audit = await databaseClient.db().collection("project_visibility_audit").find({ requestId }).sort({ phase: 1 }).toArray();
			assert.deepEqual(audit.map(record => record.phase), ["attempt", "result"]);
			assert.deepEqual(audit.map(record => record.actor), ["artifact-test", "artifact-test"]);
		}
		finally {
			await stopService(api);
		}
		assert.equal(api.child.exitCode, 0, `API did not shut down cleanly.\n${api.output()}`);

		const unavailable = startService(
			path.join(artifactRoot, "back-end/dist/server.js"),
			artifactRoot,
			cleanEnvironment({
				HOST: "127.0.0.1",
				MONGODB_URI: "mongodb://127.0.0.1:1/unavailable",
				NODE_ENV: "production",
				PORT: String(await ephemeralPort())
			})
		);
		assert.equal(await waitForExit(unavailable.child, 10_000), true, "Unavailable dependency startup did not terminate.");
		assert.equal(unavailable.child.exitCode, 1, unavailable.output());
		assert.match(unavailable.output(), /Backend startup failed: (?:Error|MongoServerSelectionError)/u);
		assert.doesNotMatch(unavailable.output(), /mongodb(?:\+srv)?:\/\/|unavailable/iu);

		await databaseClient.db().dropDatabase();
		await databaseClient.close();
		databaseClient = undefined;
	}

	const unexpectedDirectory = path.join(artifactRoot, "unexpected-empty-directory");
	await mkdir(unexpectedDirectory);
	const unmanifestedDirectory = runSync(process.execPath, [verifier, artifactRoot], {
		cwd: acceptanceRoot,
		env: cleanEnvironment({ RUNTIME_ARTIFACT_EXPECT_COMMIT: expectedCommit })
	});
	assert.notEqual(unmanifestedDirectory.status, 0);
	assert.match(unmanifestedDirectory.output, /directory inventory mismatch/iu);
	await rm(unexpectedDirectory, { recursive: true });

	await rm(path.join(artifactRoot, "back-end/dist/projectCatalog.js"));
	const missingModule = runSync(process.execPath, [verifier, artifactRoot], {
		cwd: acceptanceRoot,
		env: cleanEnvironment({ RUNTIME_ARTIFACT_EXPECT_COMMIT: expectedCommit })
	});
	assert.notEqual(missingModule.status, 0);
	assert.match(missingModule.output, /inventory or hash mismatch.*projectCatalog\.js/iu);
	process.stdout.write("Runtime artifact smoke passed from an isolated clean tree.\n");
}
finally {
	if (databaseClient) await databaseClient.close().catch(() => undefined);
	await rm(acceptanceRoot, { force: true, recursive: true });
}
