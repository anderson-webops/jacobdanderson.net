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
import { GALLERY_SITES, galleryDocumentPath, galleryOrigin } from "../front-end/src/config/gallerySites.ts";

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
let trustedCertificate;

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

function request(port, pathname, { body, headers = {}, hostname = "jacobdanderson.net", method = "GET" } = {}) {
	if (!trustedCertificate) throw new Error("The test certificate is not ready.");
	return new Promise((resolve, reject) => {
		const request = https.request({
			ca: trustedCertificate,
			headers: { Host: hostname, ...headers },
			host: "127.0.0.1",
			method,
			path: pathname,
			port,
			servername: hostname,
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

function httpRequest(port, pathname, hostname = "jacobdanderson.net") {
	return new Promise((resolve, reject) => {
		const request = http.request({
			headers: { Host: hostname },
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
	await writeFile(path.join(staticRoot, "deployment.json"), "{\"commit\":\"synthetic\",\"ref\":\"v2.14.2\"}\n");
	await writeFile(path.join(staticRoot, "admin", "index.html"), "admin\n");
	for (const site of GALLERY_SITES) {
		const directory = path.join(staticRoot, galleryDocumentPath(site).slice(1));
		await mkdir(directory, { recursive: true });
		await writeFile(path.join(directory, "index.html"), `<title>${site.title}</title>\n`);
		await writeFile(path.join(directory, "robots.txt"), `Sitemap: ${galleryOrigin(site)}/sitemap.xml\n`);
		await writeFile(path.join(directory, "sitemap.xml"), `<loc>${galleryOrigin(site)}/</loc>\n`);
	}
	await mkdir(path.join(staticRoot, "assets", "fonts"), { recursive: true });
	await writeFile(path.join(staticRoot, "assets", "fonts", "fixture.woff2"), "font fixture\n");
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
		"-addext",
		`subjectAltName=DNS:jacobdanderson.net,${GALLERY_SITES.map(site => `DNS:${site.hostname}`).join(",")}`,
		"-keyout",
		certificateKey,
		"-out",
		certificate
	], { stdio: "ignore" });
	trustedCertificate = await readFile(certificate);

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

	let galleryHosts = await readFile(
		path.join(repositoryRoot, "deploy/nginx/jacobdanderson-gallery-sites.conf.example"),
		"utf8"
	);
	galleryHosts = galleryHosts
		.replace("proxy_pass http://127.0.0.1:3003;", `proxy_pass http://127.0.0.1:${backendPort};`)
		.replace("\tlisten 80;", `\tlisten 127.0.0.1:${httpPort};`)
		.replace("\tlisten [::]:80;", "")
		.replace("\tlisten 443 ssl;", `\tlisten 127.0.0.1:${httpsPort} ssl${supportsHttp2Directive ? "" : " http2"};`)
		.replace("\tlisten [::]:443 ssl;", "")
		.replace("\t# ssl_certificate /etc/letsencrypt/live/gallery-sites/fullchain.pem;", `\tssl_certificate ${certificate};`)
		.replace("\t# ssl_certificate_key /etc/letsencrypt/live/gallery-sites/privkey.pem;", `\tssl_certificate_key ${certificateKey};`)
		.replace("root /srv/jacobdanderson.net/current/front-end/dist;", `root ${staticRoot};`)
		.replace("root /var/www/acme;", `root ${acmeRoot};`);
	if (!supportsHttp2Directive) galleryHosts = galleryHosts.replace("\thttp2 on;", "");

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
	fastcgi_temp_path ${path.join(workDirectory, "fastcgi")};
	uwsgi_temp_path ${path.join(workDirectory, "uwsgi")};
	scgi_temp_path ${path.join(workDirectory, "scgi")};
	${limits}
	${virtualHost}
	${galleryHosts}
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

	const canonicalRelease = await request(httpsPort, "/deployment.json");
	assert.equal(canonicalRelease.status, 200);
	assert.deepEqual(JSON.parse(canonicalRelease.body), { commit: "synthetic", ref: "v2.14.2" });
	const releaseAlias = await request(httpsPort, "/release.json");
	assert.equal(releaseAlias.status, 307);
	const releaseDestination = new URL(releaseAlias.headers.location, `https://jacobdanderson.net:${httpsPort}`);
	assert.equal(releaseDestination.origin, `https://jacobdanderson.net:${httpsPort}`);
	assert.equal(releaseDestination.pathname, "/deployment.json");
	assert.equal(releaseAlias.headers["cache-control"], "no-store");
	assert.equal((await request(httpsPort, "/release.json", { method: "HEAD" })).status, 307);
	assert.equal((await request(httpsPort, "/release.json", { method: "POST" })).status, 405);

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

	for (const pathname of ["/ADMIN", "/admin/index.html"]) {
		const redirect = await request(httpsPort, pathname);
		assert.equal(redirect.status, 308);
		assert.equal(new URL(redirect.headers.location).pathname, "/admin");
	}
	for (const pathname of ["/admin", "/admin/"]) {
		const page = await request(httpsPort, pathname);
		assert.equal(page.status, 200);
		assert.equal(page.headers["www-authenticate"], undefined);
		assert.equal(page.headers["cache-control"], "no-store");
	}
	assert.equal((await request(httpsPort, "/api/admin/access")).status, 403);
	assert.equal((await request(httpsPort, "/api/admin/gallery/photos", { method: "POST" })).status, 403);
	assert.equal((await request(httpsPort, "/api/admin/projects/oscre", { method: "PATCH" })).status, 403);
	const adminAuthorization = { Authorization: `Basic ${Buffer.from("jacob:test-password").toString("base64")}` };
	for (const [pathname, method] of [["/api/admin/access", "GET"], ["/api/admin/gallery/photos", "POST"]]) {
		await new Promise(resolveSlot => setTimeout(resolveSlot, 550));
		const accepted = await request(httpsPort, pathname, { method, headers: adminAuthorization });
		assert.equal(accepted.status, 200);
		assert.equal(JSON.parse(accepted.body).headers.actor, "jacob");
		assert.equal(JSON.parse(accepted.body).headers.authorization, null);
	}
	const gallery = await request(httpsPort, "/api/gallery/drawings", { headers: adminAuthorization });
	assert.equal(gallery.status, 200);
	assert.deepEqual(JSON.parse(gallery.body).headers, { actor: null, authorization: null, key: null, requestId: null });
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

	for (const site of GALLERY_SITES) {
		const { hostname } = site;
		const origin = galleryOrigin(site);
		const home = await request(httpsPort, "/", { hostname });
		assert.equal(home.status, 200);
		assert.equal(home.body, `<title>${site.title}</title>\n`);
		assert.match(home.headers["content-type"], /^text\/html/);
		assert.equal(home.headers["x-content-type-options"], "nosniff");
		assert.equal((await request(httpsPort, "/", { hostname, method: "HEAD" })).status, 200);
		const redirect = await httpRequest(httpPort, "/?view=gallery", hostname);
		assert.equal(redirect.headers.location, `${origin}/?view=gallery`);
		assert.equal((await request(httpsPort, "/robots.txt", { hostname })).body, `Sitemap: ${origin}/sitemap.xml\n`);
		assert.equal((await request(httpsPort, "/sitemap.xml", { hostname })).body, `<loc>${origin}/</loc>\n`);
		assert.equal((await request(httpsPort, "/deployment.json", { hostname })).body, canonicalRelease.body);
		assert.equal((await request(httpsPort, "/assets/fonts/fixture.woff2", { hostname })).body, "font fixture\n");
		assert.equal((await request(httpsPort, `${galleryDocumentPath(site)}/index.html`)).status, 404);
		const media = `/api/gallery/${site.gallery}`;
		const image = `${media}/0123456789abcdef01234567?preview=1`;
		for (const pathname of [`${media}?before=0123456789abcdef01234567`, image]) {
			const response = await request(httpsPort, pathname, {
				hostname,
				headers: {
					"Authorization": "Bearer fixture",
					"X-Portfolio-Admin-Actor": "fixture",
					"X-Portfolio-Admin-Key": "fixture",
					"X-Portfolio-Request-Id": "fixture"
				}
			});
			assert.equal(response.status, 200);
			const payload = JSON.parse(response.body);
			assert.equal(payload.path, pathname);
			assert.deepEqual(payload.headers, { actor: null, authorization: null, key: null, requestId: null });
		}
		assert.equal((await request(httpsPort, image, { hostname, method: "HEAD" })).status, 200);
		assert.equal((await request(httpsPort, media, { hostname, method: "POST" })).status, 405);
		const other = site.gallery === "photos" ? "drawings" : "photos";
		for (const pathname of [
			"/admin",
			"/api/admin/access",
			"/api/projects/visibility",
			"/index.html",
			"/extra/photos",
			`${galleryDocumentPath(site)}/index.html`,
			`${media}/invalid`,
			`/api/gallery/${other}`,
			`/api/gallery/${other}/0123456789abcdef01234567`
		]) {
			assert.equal((await request(httpsPort, pathname, { hostname })).status, 404, hostname + pathname);
		}
	}

	console.log(`Nginx ${nginxVersion.join(".")} edge contract passed for the portfolio and both gallery hosts.`);
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
