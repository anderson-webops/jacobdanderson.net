import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
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
		TMPDIR: process.env.TMPDIR || os.tmpdir(),
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

function serviceEnvironment(mongoUri, port, overrides = {}) {
	return cleanEnvironment({
		ALLOW_PUBLIC_LISTENER: "false",
		ENABLE_INTERNAL_DIAGNOSTICS: "false",
		ENABLE_PROJECT_ADMIN: "false",
		HOST: "127.0.0.1",
		MONGODB_URI: mongoUri,
		NODE_ENV: "production",
		PORT: String(port),
		TRUST_PROXY_IPS: "loopback",
		...overrides
	});
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
	const manifestPath = path.join(artifactRoot, ".runtime-manifest.json");
	const manifestBytes = await readFile(manifestPath);
	const manifest = JSON.parse(manifestBytes);
	const expectedCommit = process.env.RUNTIME_ARTIFACT_EXPECT_COMMIT || manifest.source.commit;
	const requireClean = process.env.RUNTIME_ARTIFACT_REQUIRE_CLEAN || "false";
	const allowRetainedNode24 = process.env.RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE24 === "true" ? "true" : "false";
	const allowRetainedNode26 = process.env.RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE26 === "true" ? "true" : "false";
	const verificationEnvironment = cleanEnvironment({
		RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE24: allowRetainedNode24,
		RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE26: allowRetainedNode26,
		RUNTIME_ARTIFACT_EXPECT_COMMIT: expectedCommit,
		RUNTIME_ARTIFACT_REQUIRE_CLEAN: requireClean
	});
	const verification = runSync(process.execPath, [verifier, artifactRoot], {
		cwd: acceptanceRoot,
		env: verificationEnvironment
	});
	assert.equal(verification.status, 0, verification.output);
	if (manifest.toolchain.node === "v26.13.1") {
		try {
			for (const buildSdk of [
				undefined,
				{ ...manifest.toolchain.buildSdk, lockSha256: "0".repeat(64) },
				{ ...manifest.toolchain.buildSdk, payloadTreeSha256: "0".repeat(64) },
				{ ...manifest.toolchain.buildSdk, commit: "0".repeat(40) }
			]) {
				await writeFile(manifestPath, JSON.stringify({ ...manifest, toolchain: { ...manifest.toolchain, buildSdk } }));
				const invalidSdk = runSync(process.execPath, [verifier, artifactRoot], {
					cwd: acceptanceRoot,
					env: verificationEnvironment
				});
				assert.notEqual(invalidSdk.status, 0, invalidSdk.output);
				assert.match(invalidSdk.output, /toolchain/iu);
			}
		}
		finally {
			await writeFile(manifestPath, manifestBytes);
		}
	}
	if (manifest.toolchain.node === "v26.13.0") {
		for (const overrides of [
			{ RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE26: "false" },
			{ RUNTIME_ARTIFACT_EXPECT_COMMIT: "0".repeat(40) },
			{ RUNTIME_ARTIFACT_REQUIRE_CLEAN: "false" }
		]) {
			const invalidRetained = runSync(process.execPath, [verifier, artifactRoot], {
				cwd: acceptanceRoot,
				env: { ...verificationEnvironment, ...overrides }
			});
			assert.notEqual(invalidRetained.status, 0, invalidRetained.output);
		}
		try {
			await writeFile(manifestPath, Buffer.concat([manifestBytes, Buffer.from("\n")]));
			const changedRetained = runSync(process.execPath, [verifier, artifactRoot], {
				cwd: acceptanceRoot,
				env: verificationEnvironment
			});
			assert.notEqual(changedRetained.status, 0, changedRetained.output);
			assert.match(changedRetained.output, /toolchain/iu);
		}
		finally {
			await writeFile(manifestPath, manifestBytes);
		}
	}
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
		const legacyCreatedAt = new Date("2026-08-27T12:00:00.000Z");
		const legacyUpdatedAt = new Date("2026-08-27T12:30:00.000Z");
		const legacyVisibility = databaseClient.db().collection("project_visibility");
		assert.equal(
			await legacyVisibility.createIndex({ slug: 1 }, { unique: true }),
			"slug_1",
			"The retained v2.11.0 schema must use Mongoose's default unique-index name."
		);
		await legacyVisibility.insertOne({
			createdAt: legacyCreatedAt,
			slug: "oscre",
			updatedAt: legacyUpdatedAt,
			visible: true
		});

		const apiPort = await ephemeralPort();
		const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
		const adminKey = "artifact-admin-key-0123456789abcdef";
		const requestId = "0123456789abcdef0123456789abcdef";
		const api = startService(
			path.join(artifactRoot, "back-end/dist/server.js"),
			artifactRoot,
			serviceEnvironment(mongoUri, apiPort, {
				ENABLE_PROJECT_ADMIN: "true",
				PROJECT_ADMIN_PROXY_KEY: adminKey
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
			if (process.env.RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE26 !== "true" && process.env.RUNTIME_ARTIFACT_ALLOW_RETAINED_NODE24 !== "true") {
				const headers = { "X-Portfolio-Admin-Actor": "artifact-test", "X-Portfolio-Admin-Key": adminKey, "X-Portfolio-Request-Id": requestId };
				assert.equal((await fetch(`${apiBaseUrl}/api/admin/access`, { headers })).status, 204);
				assert.equal((await fetch(`${apiBaseUrl}/api/admin/access`)).status, 403);
				for (const category of ["photos", "drawings"]) {
					const path = `${apiBaseUrl}/api/admin/gallery/${category}`;
					const body = Buffer.from([18, 52, 86, 255]);
					const upload = { method: "POST", body, headers: { ...headers, "Content-Type": "application/octet-stream", "X-Image-Width": "1", "X-Image-Height": "1", "X-Image-Description": "Test%20pixel" } };
					assert.equal((await fetch(path, { method: "POST", body })).status, 403);
					assert.equal((await fetch(path, { ...upload, body: Buffer.from([1]) })).status, 400);
					const created = await fetch(path, upload);
					assert.equal(created.status, 201);
					const { id } = await created.json();
					const publicPath = `${apiBaseUrl}/api/gallery/${category}`;
					const change = (image, action, payload) => fetch(`${path}/${image}/${action}`, {
						method: "POST",
						headers: { ...headers, "Content-Type": "application/json" },
						body: JSON.stringify(payload)
					});
					assert.deepEqual(await (await fetch(publicPath)).json(), { items: [{ id, description: "Test pixel", width: 1, height: 1 }], next: null });
					const media = await fetch(`${publicPath}/${id}`);
					assert.equal(media.headers.get("content-type"), "image/png");
					assert.equal(Buffer.from(await media.arrayBuffer()).subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
					assert.equal((await fetch(`${apiBaseUrl}/api/gallery/${category === "photos" ? "drawings" : "photos"}/${id}`)).status, 404);
					if (category === "drawings") {
						const large = await fetch(path, {
							...upload,
							body: randomBytes(768 * 1024 * 4),
							headers: { ...upload.headers, "X-Image-Width": "768", "X-Image-Height": "1024" }
						});
						assert.equal(large.status, 201);
						const largerId = (await large.json()).id;
						const fullUrl = `${publicPath}/${largerId}`;
						const full = Buffer.from(await (await fetch(fullUrl)).arrayBuffer());
						const previewResponse = await fetch(`${fullUrl}?preview=1`);
						assert.equal(previewResponse.headers.get("content-type"), "image/png");
						assert.match(previewResponse.headers.get("cache-control"), /public/);
						const preview = Buffer.from(await previewResponse.arrayBuffer());
						assert.equal(full.readUInt32BE(20), 1024);
						assert.equal(preview.readUInt32BE(16), 384);
						assert.equal(preview.readUInt32BE(20), 512);
						assert.ok(preview.length < full.length * 0.35);
						const cached = Buffer.from(await (await fetch(`${fullUrl}?preview=1`)).arrayBuffer());
						assert.deepEqual(cached, preview);
						assert.equal((await fetch(`${fullUrl}?preview=2`)).status, 400);
						assert.equal((await change(largerId, "visibility", { visible: false })).status, 204);
						assert.equal((await fetch(`${fullUrl}?preview=1`)).status, 404);
						assert.equal((await fetch(fullUrl)).status, 404);
						const privateImage = await fetch(`${path}/hidden/${largerId}`, { headers });
						assert.equal(privateImage.headers.get("cache-control"), "no-store");
						assert.deepEqual(Buffer.from(await privateImage.arrayBuffer()), preview);
						assert.equal((await change(largerId, "visibility", { visible: true })).status, 204);
						assert.equal((await fetch(`${path}/hidden/${largerId}`, { headers })).status, 404);
					}
					const record = await databaseClient.db().collection("gallery_images").findOne({ gallery: category });
					assert.equal(record.actor, "artifact-test");
					assert.equal(record.requestId, requestId);
					const favoritePath = `${apiBaseUrl}/api/admin/gallery/photos/${id}/favorite`;
					const update = { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: "{\"favorite\":true}" };
					assert.equal((await fetch(favoritePath, { ...update, headers: { "Content-Type": "application/json" } })).status, 403);
					assert.equal((await fetch(favoritePath, { ...update, body: "{\"favorite\":1}" })).status, 400);
					assert.equal((await fetch(favoritePath, update)).status, category === "photos" ? 204 : 404);
					if (category === "photos") {
						const collection = databaseClient.db().collection("gallery_images");
						const fixtures = Array.from({ length: 48 }, (_, index) => ({
							_id: new mongodbModule.ObjectId((index + 1).toString(16).padStart(24, "0")),
							gallery: "photos",
							description: `Fixture photo ${index}`,
							width: 1,
							height: 1,
							...(index < 25 ? { favorite: true } : {})
						}));
						await collection.insertMany(fixtures);
						const first = await (await fetch(publicPath)).json();
						const second = await (await fetch(`${publicPath}?before=${first.next}`)).json();
						const third = await (await fetch(`${publicPath}?before=${second.next}`)).json();
						assert.deepEqual([first.items.length, second.items.length, third.items.length], [24, 24, 1]);
						assert.equal(third.next, null);
						const all = [...first.items, ...second.items, ...third.items];
						assert.equal(new Set(all.map(item => item.id)).size, 49);
						assert.equal(all.find(item => item.id === id)?.favorite, true);
						assert.ok(all.slice(0, 26).every(item => item.favorite === true));
						assert.ok(all.slice(26).every(item => item.favorite === undefined));
						assert.equal((await fetch(favoritePath, { ...update, body: "{\"favorite\":false}" })).status, 204);
						assert.equal((await collection.findOne({ _id: record._id })).favorite, undefined);
						const favoriteAudit = await databaseClient.db().collection("gallery_favorite_audit").find({ imageId: record._id, phase: "result" }).toArray();
						assert.deepEqual(favoriteAudit.map(event => [event.actor, event.previousFavorite, event.requestedFavorite]), [["artifact-test", false, true], ["artifact-test", true, false]]);
					}
					const pair = [];
					for (const title of ["First pick", "Second pick"]) {
						const response = await fetch(path, { ...upload, headers: { ...upload.headers, "X-Image-Description": title } });
						assert.equal(response.status, 201);
						const item = (await response.json()).id;
						assert.equal((await change(item, "favorite", { favorite: true })).status, 204);
						pair.push(item);
					}
					const top = async () => (await (await fetch(publicPath)).json()).items.slice(0, 2).map(item => item.id);
					assert.deepEqual(await top(), [...pair].reverse());
					assert.equal((await change(pair[0], "move", { direction: "earlier" })).status, 204);
					assert.deepEqual(await top(), pair);
					assert.equal((await change(pair[0], "move", { direction: "earlier" })).status, 409);
					assert.equal((await change(pair[0], "move", { direction: "later" })).status, 204);
					assert.deepEqual(await top(), [...pair].reverse());
					const optional = { ...upload.headers };
					delete optional["X-Image-Description"];
					const withoutDescription = await fetch(path, { ...upload, headers: optional });
					assert.equal(withoutDescription.status, 201);
					const third = (await withoutDescription.json()).id;
					const allItems = async () => (await (await fetch(publicPath)).json()).items;
					const thirdDoc = await databaseClient.db().collection("gallery_images").findOne({ _id: new mongodbModule.ObjectId(third) });
					assert.equal(thirdDoc.description, category === "photos" ? "Untitled photo" : "Untitled drawing");
					assert.equal((await change(pair[0], "move", { targetId: third, placement: "after" })).status, 409);
					assert.equal((await change(third, "favorite", { favorite: true })).status, 204);
					assert.equal((await change(pair[0], "move", { targetId: third, placement: "before" })).status, 204);
					assert.deepEqual((await allItems()).slice(0, 3).map(image => image.id), [pair[0], third, pair[1]]);
					assert.equal((await change(pair[0], "move", { targetId: pair[1], placement: "after" })).status, 204);
					assert.deepEqual((await allItems()).slice(0, 3).map(image => image.id), [third, pair[1], pair[0]]);
					assert.equal((await change(pair[0], "move", { targetId: pair[0], placement: "after" })).status, 400);
					assert.equal((await change(pair[0], "move", { targetId: "bad", placement: "before" })).status, 400);
					for (const description of [" ", "a".repeat(201), "bad\u0000name"]) {
						assert.equal((await change(pair[0], "rename", { description })).status, 400);
					}
					const pixels = await (await fetch(`${publicPath}/${pair[0]}`)).arrayBuffer();
					assert.equal((await change(pair[0], "rename", { description: "  Evening light  " })).status, 204);
					assert.equal((await allItems()).find(image => image.id === pair[0]).description, "Evening light");
					assert.deepEqual(await (await fetch(`${publicPath}/${pair[0]}`)).arrayBuffer(), pixels);
					const savedName = await databaseClient.db().collection("gallery_favorite_audit").findOne({ "imageId": new mongodbModule.ObjectId(pair[0]), "change.description": "Evening light", "phase": "result" });
					assert.equal(savedName.previousDescription, "First pick");
					assert.equal((await change(third, "delete", { confirm: third })).status, 204);
					assert.equal((await change(pair[0], "move", { targetId: third, placement: "before" })).status, 409);
					assert.equal((await change(pair[0], "visibility", { visible: false })).status, 204);
					assert.equal((await change(pair[1], "move", { targetId: pair[0], placement: "after" })).status, 409);
					assert.equal((await change(pair[0], "rename", { description: "Private caption" })).status, 204);
					assert.equal((await (await fetch(`${path}/hidden`, { headers })).json()).items[0].description, "Private caption");
					assert.equal((await fetch(`${path}/hidden`)).status, 403);
					assert.deepEqual((await (await fetch(`${path}/hidden`, { headers })).json()).items.map(item => item.id), [pair[0]]);
					assert.equal((await fetch(`${publicPath}/${pair[0]}`)).status, 404);
					assert.equal((await change(pair[0], "delete", { confirm: pair[1] })).status, 400);
					assert.equal((await change(pair[0], "delete", { confirm: pair[0] })).status, 204);
					assert.deepEqual((await (await fetch(`${path}/hidden`, { headers })).json()).items, []);
					assert.equal((await fetch(`${path}/hidden/${pair[0]}`, { headers })).status, 404);
					assert.equal((await change(pair[0], "visibility", { visible: true })).status, 404);
					assert.equal((await fetch(`${publicPath}/${pair[1]}`)).status, 200);
				}
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
			const persisted = await legacyVisibility.findOne({ slug: "oscre" });
			assert.equal(persisted?.visible, false);
			assert.deepEqual(persisted?.createdAt, legacyCreatedAt);
			assert.notDeepEqual(persisted?.updatedAt, legacyUpdatedAt);
			const visibilityIndexes = await legacyVisibility.listIndexes().toArray();
			assert.deepEqual(
				visibilityIndexes
					.filter(index => index.name !== "_id_")
					.map(index => ({ key: index.key, name: index.name, unique: index.unique })),
				[{ key: { slug: 1 }, name: "slug_1", unique: true }],
				"The upgrade must retain the exact v2.11.0 uniqueness index without a renamed duplicate."
			);
			assert.equal(
				await legacyVisibility.createIndex({ slug: 1 }, { unique: true }),
				"slug_1",
				"The retained database must remain index-compatible with a v2.11.0 rollback."
			);
		}
		finally {
			await stopService(api);
		}
		assert.equal(api.child.exitCode, 0, `API did not shut down cleanly.\n${api.output()}`);

		await databaseClient.db().dropDatabase();
		const incompatibleVisibility = databaseClient.db().collection("project_visibility");
		assert.equal(
			await incompatibleVisibility.createIndex({ slug: 1 }),
			"slug_1"
		);
		const incompatible = startService(
			path.join(artifactRoot, "back-end/dist/server.js"),
			artifactRoot,
			serviceEnvironment(mongoUri, await ephemeralPort())
		);
		assert.equal(
			await waitForExit(incompatible.child, 10_000),
			true,
			"An incompatible legacy uniqueness index did not fail startup."
		);
		assert.equal(incompatible.child.exitCode, 1, incompatible.output());
		assert.match(incompatible.output(), /Backend startup failed: MongoServerError/u);
		assert.doesNotMatch(incompatible.output(), /mongodb(?:\+srv)?:\/\/|jacob_artifact_/iu);

		await databaseClient.db().dropDatabase();
		const freshPorts = await Promise.all([ephemeralPort(), ephemeralPort()]);
		const freshServices = freshPorts.map(port => startService(
			path.join(artifactRoot, "back-end/dist/server.js"),
			artifactRoot,
			serviceEnvironment(mongoUri, port)
		));
		try {
			await Promise.all(freshServices.map((service, index) => (
				waitForResponse(service, `http://127.0.0.1:${freshPorts[index]}/readyz`)
			)));
			const freshIndexes = await databaseClient.db().collection("project_visibility").listIndexes().toArray();
			assert.deepEqual(
				freshIndexes
					.filter(index => index.name !== "_id_")
					.map(index => ({ key: index.key, name: index.name, unique: index.unique })),
				[{ key: { slug: 1 }, name: "slug_1", unique: true }]
			);
		}
		finally {
			await Promise.all(freshServices.map(stopService));
		}
		for (const service of freshServices) {
			assert.equal(service.child.exitCode, 0, `Concurrent API did not shut down cleanly.\n${service.output()}`);
		}

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
		env: verificationEnvironment
	});
	assert.notEqual(unmanifestedDirectory.status, 0);
	assert.match(unmanifestedDirectory.output, /directory inventory mismatch/iu);
	await rm(unexpectedDirectory, { recursive: true });

	await rm(path.join(artifactRoot, "back-end/dist/projectCatalog.js"));
	const missingModule = runSync(process.execPath, [verifier, artifactRoot], {
		cwd: acceptanceRoot,
		env: verificationEnvironment
	});
	assert.notEqual(missingModule.status, 0);
	assert.match(missingModule.output, /inventory or hash mismatch.*projectCatalog\.js/iu);
	process.stdout.write("Runtime artifact smoke passed from an isolated clean tree.\n");
}
finally {
	if (databaseClient) await databaseClient.close().catch(() => undefined);
	await rm(acceptanceRoot, { force: true, recursive: true });
}
