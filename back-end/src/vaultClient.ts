import { env } from "node:process";
import { z } from "zod";
import { fetchJsonBounded } from "./utils/boundedFetch.js";

const MAX_VAULT_ADDRESS_LENGTH = 2_048;
const MAX_VAULT_CREDENTIAL_LENGTH = 4_096;
const MAX_VAULT_TOKEN_LENGTH = 4_096;
const MAX_MONGO_URI_LENGTH = 8_192;

function boundedOpaqueValue(maximum: number) {
	return z.string()
		.min(1)
		.max(maximum)
		.refine(value => !/[\r\n\0]/.test(value), "Value contains forbidden control characters.");
}

const vaultLoginResponseSchema = z.object({
	auth: z.object({
		client_token: boundedOpaqueValue(MAX_VAULT_TOKEN_LENGTH)
	})
});

const vaultSecretResponseSchema = z.object({
	data: z.object({
		data: z.object({
			uri: boundedOpaqueValue(MAX_MONGO_URI_LENGTH)
		})
	})
});

export function validateVaultAddress(environment: NodeJS.ProcessEnv = env): URL {
	const rawAddress = (environment.VAULT_ADDR || "http://127.0.0.1:8200").trim();
	if (!rawAddress || rawAddress.length > MAX_VAULT_ADDRESS_LENGTH || /[\r\n\0]/.test(rawAddress)) {
		throw new Error(`VAULT_ADDR must be at most ${MAX_VAULT_ADDRESS_LENGTH} characters without controls.`);
	}

	let parsed: URL;
	try {
		parsed = new URL(rawAddress);
	}
	catch {
		throw new Error("VAULT_ADDR must be a valid HTTP or HTTPS origin.");
	}
	if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
		throw new Error("VAULT_ADDR must be an HTTP or HTTPS origin without embedded credentials.");
	}
	if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
		throw new Error("VAULT_ADDR must be an origin without a path, query, or fragment.");
	}
	const loopbackHosts = new Set(["127.0.0.1", "::1", "[::1]", "localhost"]);
	if (parsed.protocol !== "https:" && !loopbackHosts.has(parsed.hostname)) {
		throw new Error("VAULT_ADDR must use HTTPS unless Vault is on the local host.");
	}
	return parsed;
}

export function vaultConfigurationState(
	environment: NodeJS.ProcessEnv = env
): "configured" | "disabled" | "incomplete" {
	const hasRole = Boolean(environment.VAULT_ROLE_ID?.trim());
	const hasSecret = Boolean(environment.VAULT_SECRET_ID?.trim());
	if (hasRole && hasSecret) return "configured";
	if (!hasRole && !hasSecret) return "disabled";
	return "incomplete";
}

export function validateVaultCredentials(environment: NodeJS.ProcessEnv = env): {
	roleId: string;
	secretId: string;
} {
	if (vaultConfigurationState(environment) !== "configured") {
		throw new Error("Vault AppRole credentials are not completely configured.");
	}

	const roleId = environment.VAULT_ROLE_ID!.trim();
	const secretId = environment.VAULT_SECRET_ID!.trim();
	for (const [name, value] of [["VAULT_ROLE_ID", roleId], ["VAULT_SECRET_ID", secretId]] as const) {
		if (value.length > MAX_VAULT_CREDENTIAL_LENGTH || /[\r\n\0]/.test(value)) {
			throw new Error(`${name} must be at most ${MAX_VAULT_CREDENTIAL_LENGTH} characters without controls.`);
		}
	}
	return { roleId, secretId };
}

async function vaultLogin(environment: NodeJS.ProcessEnv): Promise<string> {
	const credentials = validateVaultCredentials(environment);

	const { data, response } = await fetchJsonBounded<unknown>(
		new URL("/v1/auth/approle/login", validateVaultAddress(environment)),
		{
			body: JSON.stringify({
				role_id: credentials.roleId,
				secret_id: credentials.secretId
			}),
			headers: { "Content-Type": "application/json" },
			method: "POST"
		}
	);
	if (!response.ok) throw new Error(`Vault login failed with status ${response.status}.`);
	return vaultLoginResponseSchema.parse(data).auth.client_token;
}

export async function readMongoSecret(environment: NodeJS.ProcessEnv = env): Promise<{ uri: string }> {
	const token = await vaultLogin(environment);
	const { data, response } = await fetchJsonBounded<unknown>(
		new URL("/v1/secret/data/jacob/mongodb", validateVaultAddress(environment)),
		{
			headers: { "X-Vault-Token": token }
		}
	);
	if (!response.ok) throw new Error(`Vault secret read failed with status ${response.status}.`);
	return vaultSecretResponseSchema.parse(data).data.data;
}
