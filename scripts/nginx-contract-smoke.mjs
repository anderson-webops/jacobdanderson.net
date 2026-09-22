import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const nginxBinary = process.env.NGINX_BIN || "nginx";
const nginxVersionResult = spawnSync(nginxBinary, ["-v"], { encoding: "utf8" });

if (nginxVersionResult.error?.code === "ENOENT") {
	if (process.env.NGINX_REQUIRED === "true") throw new Error("Nginx is required but was not found.");
	console.log("Nginx contract smoke skipped because nginx is not installed.");
	process.exit(0);
}
if (nginxVersionResult.status !== 0) {
	throw new Error(`Unable to inspect Nginx: ${nginxVersionResult.stderr || nginxVersionResult.stdout}`);
}

const versionText = `${nginxVersionResult.stderr || ""}${nginxVersionResult.stdout || ""}`;
const versionMatch = versionText.match(/nginx\/(\d+)\.(\d+)\.(\d+)/);
if (!versionMatch) throw new Error(`Unable to parse Nginx version from: ${versionText.trim()}`);
const nginxVersion = versionMatch.slice(1).map(Number);
const supportsHttp2Directive = nginxVersion[0] > 1
	|| (nginxVersion[0] === 1 && nginxVersion[1] > 25)
	|| (nginxVersion[0] === 1 && nginxVersion[1] === 25 && nginxVersion[2] >= 1);

async function availablePort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("Expected an available TCP port.");
	await new Promise(resolve => server.close(resolve));
	return address.port;
}

async function listen(server) {
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const address = server.address();
	if (!address || typeof address === "string") throw new Error("Expected a backend TCP listener.");
	return address.port;
}

function request(port, pathname, { body, headers = {}, method = "GET" } = {}) {
	return new Promise((resolve, reject) => {
		const request = https.request({
			headers: { Host: "jacobdanderson.net", ...headers },
			host: "127.0.0.1",
			method,
			path: pathname,
			port,
			rejectUnauthorized: false,
			timeout: 5_000
		}, (response) => {
			const chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => resolve({
				body: Buffer.concat(chunks).toString("utf8"),
				headers: response.headers,
				status: response.statusCode
			}));
		});
		request.once("error", reject);
		request.once("timeout", () => request.destroy(new Error(`Timed out requesting ${pathname}.`)));
		request.end(body);
	});
}

function httpRequest(port, pathname) {
	return new Promise((resolve, reject) => {
		const request = http.request({
			headers: { Host: "jacobdanderson.net" },
			host: "127.0.0.1",
			path: pathname,
			port,
			timeout: 5_000
		}, (response) => {
			const chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => resolve({
				body: Buffer.concat(chunks).toString("utf8"),
				headers: response.headers,
				status: response.statusCode
			}));
		});
		request.once("error", reject);
		request.once("timeout", () => request.destroy(new Error(`Timed out requesting ${pathname}.`)));
		request.end();
	});
}

async function waitForNginx(port, child) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		if (child.exitCode !== null) throw new Error("Nginx exited before accepting requests.");
		try {
			const response = await request(port, "/healthz");
			if (response.status === 200) return;
		}
		catch {
			// The listener is still starting.
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error("Nginx did not become ready for contract testing.");
}

const workDirectory = await mkdtemp(path.join(os.tmpdir(), "jacobdanderson-nginx-"));
let nginxProcess;
const backend = http.createServer((incoming, response) => {
	response.setHeader("Cache-Control", "no-store");
	response.setHeader("Content-Type", "application/json");
	response.end(JSON.stringify({
		headers: {
			actor: incoming.headers["x-portfolio-admin-actor"] || null,
			authorization: incoming.headers.authorization || null,
			key: incoming.headers["x-portfolio-admin-key"] || null,
			requestId: incoming.headers["x-portfolio-request-id"] || null
		},
		method: incoming.method,
		path: incoming.url
	}));
});

try {
	const backendPort = await listen(backend);
	const httpPort = await availablePort();
	const httpsPort = await availablePort();
	const staticRoot = path.join(workDirectory, "static");
	const acmeRoot = path.join(workDirectory, "acme");
	const certificate = path.join(workDirectory, "certificate.pem");
	const certificateKey = path.join(workDirectory, "certificate-key.pem");
	const passwordFile = path.join(workDirectory, "admin.htpasswd");
	const secretSnippet = path.join(workDirectory, "admin-secret.conf");
	const nginxConfig = path.join(workDirectory, "nginx.conf");

	await mkdir(path.join(staticRoot, "admin"), { recursive: true });
	await mkdir(path.join(acmeRoot, ".well-known", "acme-challenge"), { recursive: true });
	await writeFile(path.join(staticRoot, "index.html"), "ok\n");
	await writeFile(path.join(staticRoot, "admin", "index.html"), "admin\n");
	await writeFile(path.join(acmeRoot, ".well-known", "acme-challenge", "contract-token"), "challenge-ok\n");
	await writeFile(passwordFile, "jacob:{PLAIN}test-password\n");
	await writeFile(secretSnippet, "proxy_set_header X-Portfolio-Admin-Key test-proxy-key-0123456789abcdef;\n");
	execFileSync("openssl", [
		"req",
		"-x509",
		"-newkey",
		"rsa:2048",
		"-nodes",
		"-days",
		"1",
		"-subj",
		"/CN=jacobdanderson.net",
		"-keyout",
		certificateKey,
		"-out",
		certificate
	], { stdio: "ignore" });

	let virtualHost = await readFile(
		path.join(repositoryRoot, "deploy/nginx/jacobdanderson.conf.example"),
		"utf8"
	);
	virtualHost = virtualHost
		.replace("server 127.0.0.1:3003;", `server 127.0.0.1:${backendPort};`)
		.replace("\tlisten 80;", `\tlisten 127.0.0.1:${httpPort};`)
		.replace("\tlisten [::]:80;", "")
		.replace("\tlisten 443 ssl;", `\tlisten 127.0.0.1:${httpsPort} ssl;`)
		.replace("\tlisten [::]:443 ssl;", "")
		.replace("\t# ssl_certificate /etc/letsencrypt/live/jacobdanderson.net/fullchain.pem;", `\tssl_certificate ${certificate};`)
		.replace("\t# ssl_certificate_key /etc/letsencrypt/live/jacobdanderson.net/privkey.pem;", `\tssl_certificate_key ${certificateKey};`)
		.replace("root /srv/jacobdanderson.net/current/front-end/dist;", `root ${staticRoot};`)
		.replace("root /var/www/acme;", `root ${acmeRoot};`)
		.replaceAll("/etc/nginx/jacobdanderson-admin.htpasswd", passwordFile)
		.replaceAll("/etc/nginx/snippets/jacobdanderson-admin-secret.conf", secretSnippet);
	if (!supportsHttp2Directive) {
		virtualHost = virtualHost
			.replace(`listen 127.0.0.1:${httpsPort} ssl;`, `listen 127.0.0.1:${httpsPort} ssl http2;`)
			.replace("\thttp2 on;", "");
	}

	const limits = await readFile(
		path.join(repositoryRoot, "deploy/nginx/jacobdanderson-rate-limits.conf.example"),
		"utf8"
	);
	await writeFile(nginxConfig, `
worker_processes 1;
pid ${path.join(workDirectory, "nginx.pid")};
error_log ${path.join(workDirectory, "error.log")} notice;
events { worker_connections 128; }
http {
	access_log off;
	client_body_temp_path ${path.join(workDirectory, "client-body")};
	proxy_temp_path ${path.join(workDirectory, "proxy")};
	${limits}
	${virtualHost}
}
`);
	await mkdir(path.join(workDirectory, "client-body"));
	await mkdir(path.join(workDirectory, "proxy"));
	execFileSync(nginxBinary, ["-p", `${workDirectory}/`, "-c", nginxConfig, "-t"], { stdio: "pipe" });

	nginxProcess = spawn(nginxBinary, ["-p", `${workDirectory}/`, "-c", nginxConfig, "-g", "daemon off;"], {
		stdio: ["ignore", "pipe", "pipe"]
	});
	await waitForNginx(httpsPort, nginxProcess);
	const challenge = await httpRequest(httpPort, "/.well-known/acme-challenge/contract-token");
	assert.equal(challenge.status, 200);
	assert.equal(challenge.body, "challenge-ok\n");
	const redirect = await httpRequest(httpPort, "/projects?from=http");
	assert.equal(redirect.status, 301);
	assert.equal(redirect.headers.location, "https://jacobdanderson.net/projects?from=http");

	for (const pathname of ["/healthz", "/readyz", "/api/healthz", "/api/readyz"]) {
		const response = await request(httpsPort, pathname, {
			headers: {
				"Authorization": "Bearer caller-controlled",
				"X-Portfolio-Admin-Actor": "spoofed",
				"X-Portfolio-Admin-Key": "spoofed",
				"X-Portfolio-Request-Id": "spoofed-request-id"
			}
		});
		assert.equal(response.status, 200, pathname);
		const payload = JSON.parse(response.body);
		assert.equal(payload.path, pathname);
		assert.deepEqual(payload.headers, { actor: null, authorization: null, key: null, requestId: null });
		assert.equal((await request(httpsPort, pathname, { method: "HEAD" })).status, 200);
		assert.equal((await request(httpsPort, pathname, { method: "POST" })).status, 405);
	}

	const publicResponse = await request(httpsPort, "/api/projects/visibility", {
		headers: {
			"Authorization": "Bearer caller-controlled",
			"X-Portfolio-Admin-Actor": "spoofed",
			"X-Portfolio-Admin-Key": "spoofed",
			"X-Portfolio-Request-Id": "spoofed-request-id"
		}
	});
	assert.equal(publicResponse.status, 200);
	assert.deepEqual(JSON.parse(publicResponse.body).headers, {
		actor: null,
		authorization: null,
		key: null,
		requestId: null
	});

	assert.equal((await request(httpsPort, "/api/admin/projects/oscre", { method: "PATCH" })).status, 401);
	const adminResponse = await request(httpsPort, "/api/admin/projects/oscre", {
		body: JSON.stringify({ visible: false }),
		headers: {
			"Authorization": `Basic ${Buffer.from("jacob:test-password").toString("base64")}`,
			"Content-Type": "application/json",
			"X-Portfolio-Admin-Actor": "spoofed",
			"X-Portfolio-Admin-Key": "spoofed",
			"X-Portfolio-Request-Id": "spoofed-request-id"
		},
		method: "PATCH"
	});
	assert.equal(adminResponse.status, 200);
	const adminPayload = JSON.parse(adminResponse.body);
	assert.equal(adminPayload.headers.actor, "jacob");
	assert.equal(adminPayload.headers.authorization, null);
	assert.equal(adminPayload.headers.key, "test-proxy-key-0123456789abcdef");
	assert.match(adminPayload.headers.requestId, /^[a-f0-9]{32}$/);
	assert.notEqual(adminPayload.headers.requestId, "spoofed-request-id");
	assert.equal((await request(httpsPort, "/api/not-a-route")).status, 404);

	console.log(`Nginx ${nginxVersion.join(".")} edge contract passed.`);
}
finally {
	if (nginxProcess && nginxProcess.exitCode === null) {
		nginxProcess.kill("SIGTERM");
		await new Promise(resolve => nginxProcess.once("exit", resolve));
	}
	backend.closeAllConnections();
	await new Promise(resolve => backend.close(resolve));
	await rm(workDirectory, { force: true, recursive: true });
}
