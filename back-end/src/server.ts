import type { Server } from "node:http";
import { isIP } from "node:net";
import path from "node:path";
import process, { env } from "node:process";
import { fileURLToPath } from "node:url";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";

import { canReadDiagnostics, validateDiagnosticsConfiguration } from "./utils/diagnostics.js";
import { resolveMongoConfiguration } from "./utils/mongoConfiguration.js";
import { logError } from "./utils/safeLog.js";

const READY_TIMEOUT_MS = 3_000;

export interface DatabaseInfo {
	databaseName: string | null;
	host: string | null;
	name: string | null;
	readyState: number;
	usingVault: boolean;
}

export interface BackendServices {
	getDatabaseInfo: () => DatabaseInfo;
	getDatabaseState: () => number;
	pingDatabase: () => Promise<void>;
}

export interface AppOptions {
	diagnosticsEnabled?: boolean;
	diagnosticsKey?: string;
	isProduction?: boolean;
	services: BackendServices;
	trustedProxies?: string;
}

function timeoutAfter<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("Operation timed out.")), timeoutMs);
		timeout.unref();
		promise.then(
			(value) => {
				clearTimeout(timeout);
				resolve(value);
			},
			(error) => {
				clearTimeout(timeout);
				reject(error);
			}
		);
	});
}

export function parseTrustedProxies(value: string | undefined): false | string[] {
	const configured = (value || "").trim();
	if (!configured) return false;

	const proxies = new Set<string>();
	for (const entry of configured.split(",").map(item => item.trim()).filter(Boolean)) {
		if (entry === "loopback") {
			proxies.add("127.0.0.1");
			proxies.add("::1");
			continue;
		}
		if (!isIP(entry)) {
			throw new Error("TRUST_PROXY_IPS must contain only exact IP addresses or the loopback alias.");
		}
		proxies.add(entry);
	}

	if (!proxies.size) return false;
	return [...proxies];
}

export function parsePort(value: string | undefined): number {
	const candidate = value || "3003";
	if (!/^\d+$/.test(candidate)) throw new Error("PORT must be an integer from 1 through 65535.");
	const port = Number(candidate);
	if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
		throw new Error("PORT must be an integer from 1 through 65535.");
	}
	return port;
}

export function parseHost(value: string | undefined): string {
	const candidate = (value || "127.0.0.1").trim();
	if (!candidate || candidate.length > 253 || /[\s/\\]/.test(candidate)) {
		throw new Error("HOST must be a valid hostname or IP address.");
	}
	return candidate;
}

export function createApp({
	diagnosticsEnabled = false,
	diagnosticsKey,
	isProduction = false,
	services,
	trustedProxies
}: AppOptions) {
	validateDiagnosticsConfiguration(diagnosticsEnabled, diagnosticsKey);

	const app = express();
	app.disable("x-powered-by");
	app.set("trust proxy", parseTrustedProxies(trustedProxies));
	app.use(
		helmet({
			strictTransportSecurity: isProduction
				? { includeSubDomains: true, maxAge: 63_072_000, preload: true }
				: false
		})
	);
	app.use(
		rateLimit({
			legacyHeaders: false,
			limit: 300,
			standardHeaders: "draft-8",
			windowMs: 60_000
		})
	);

	const healthHandler: express.RequestHandler = (_request, response) => {
		response.set("Cache-Control", "no-store").json({ ok: true });
	};

	const readinessHandler: express.RequestHandler = async (_request, response) => {
		const state = services.getDatabaseState();
		if (state !== 1) {
			return response.status(503).set("Cache-Control", "no-store").json({
				ready: false,
				components: { db: { ok: false, state } }
			});
		}

		try {
			await timeoutAfter(services.pingDatabase(), READY_TIMEOUT_MS);
			return response.set("Cache-Control", "no-store").json({
				ready: true,
				components: { db: { ok: true, state } }
			});
		}
		catch {
			return response.status(503).set("Cache-Control", "no-store").json({
				ready: false,
				components: { db: { ok: false, state } }
			});
		}
	};

	app.get("/healthz", healthHandler);
	app.get("/readyz", readinessHandler);
	app.get("/api/healthz", healthHandler);
	app.get("/api/readyz", readinessHandler);

	app.get("/_dbinfo", (request, response) => {
		if (!diagnosticsEnabled) {
			return response.status(404).set("Cache-Control", "no-store").json({ ok: false, error: "not_found" });
		}

		if (
			!canReadDiagnostics({
				configuredKey: diagnosticsKey,
				enabled: diagnosticsEnabled,
				providedKey: request.get("x-internal-diagnostics-key")
			})
		) {
			return response.status(403).set("Cache-Control", "no-store").json({ ok: false, error: "forbidden" });
		}

		return response.set("Cache-Control", "no-store").json(services.getDatabaseInfo());
	});

	app.use((_request, response) => {
		response.status(404).set("Cache-Control", "no-store").json({ ok: false, error: "not_found" });
	});

	app.use(
		(
			_error: unknown,
			_request: express.Request,
			response: express.Response,
			_next: express.NextFunction
		) => {
			response.status(500).set("Cache-Control", "no-store").json({ ok: false, error: "internal_error" });
		}
	);

	return app;
}

function summarizeMongoTarget(uri: string): string {
	const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//, "");
	const withoutAuth = withoutScheme.includes("@") ? withoutScheme.split("@").at(-1) ?? withoutScheme : withoutScheme;
	return withoutAuth.split(/[/?]/)[0] || "unknown-target";
}

async function listen(app: ReturnType<typeof createApp>, port: number, host: string): Promise<Server> {
	return await new Promise<Server>((resolve, reject) => {
		const server = app.listen(port, host);
		server.once("error", reject);
		server.once("listening", () => resolve(server));
	});
}

export async function main() {
	const diagnosticsEnabled = env.ENABLE_INTERNAL_DIAGNOSTICS === "true";
	const diagnosticsKey = env.INTERNAL_DIAGNOSTICS_KEY;
	validateDiagnosticsConfiguration(diagnosticsEnabled, diagnosticsKey);

	const mongoConfiguration = await resolveMongoConfiguration();
	const mongoTarget = summarizeMongoTarget(mongoConfiguration.uri);
	console.log(`Mongo startup: source=${mongoConfiguration.source} target=${mongoTarget}`);
	await mongoose.connect(mongoConfiguration.uri, {
		connectTimeoutMS: 5_000,
		serverSelectionTimeoutMS: 5_000
	});

	const services: BackendServices = {
		getDatabaseInfo: () => {
			const connection = mongoose.connection;
			return {
				databaseName: connection.db?.databaseName ?? null,
				host: connection.host || null,
				name: connection.name || null,
				readyState: connection.readyState,
				usingVault: mongoConfiguration.source === "vault"
			};
		},
		getDatabaseState: () => mongoose.connection.readyState,
		pingDatabase: async () => {
			const database = mongoose.connection.db;
			if (!database) throw new Error("Database unavailable.");
			await database.admin().ping();
		}
	};

	const app = createApp({
		diagnosticsEnabled,
		diagnosticsKey,
		isProduction: env.NODE_ENV === "production",
		services,
		trustedProxies: env.TRUST_PROXY_IPS
	});
	const host = parseHost(env.HOST);
	const port = parsePort(env.PORT);
	const server = await listen(app, port, host);
	console.log(`Server listening on http://${host}:${port}`);

	let isShuttingDown = false;
	const shutdown = async (signal: NodeJS.Signals) => {
		if (isShuttingDown) return;
		isShuttingDown = true;
		console.log(`${signal} received, shutting down gracefully.`);

		try {
			if (server.listening) {
				await new Promise<void>((resolve, reject) => {
					server.close(error => (error ? reject(error) : resolve()));
				});
			}
			if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
			console.log("Graceful shutdown complete.");
			process.exitCode = 0;
		}
		catch (error) {
			logError("Graceful shutdown failed", error);
			process.exitCode = 1;
		}
	};

	process.once("SIGINT", () => void shutdown("SIGINT"));
	process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (entryPath && fileURLToPath(import.meta.url) === entryPath) {
	void main().catch((error) => {
		logError("Backend startup failed", error);
		process.exitCode = 1;
	});
}
