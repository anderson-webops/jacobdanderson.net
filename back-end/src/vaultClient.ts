import { env } from "node:process";
import { z } from "zod";
import { fetchJsonBounded } from "./utils/boundedFetch.js";

const vaultLoginResponseSchema = z.object({
	auth: z.object({
		client_token: z.string().min(1)
	})
});

const vaultSecretResponseSchema = z.object({
	data: z.object({
		data: z.object({
			uri: z.string().min(1)
		})
	})
});

export function validateVaultAddress(environment: NodeJS.ProcessEnv = env): URL {
	const parsed = new URL(environment.VAULT_ADDR || "http://127.0.0.1:8200");
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

async function vaultLogin(environment: NodeJS.ProcessEnv): Promise<string> {
	if (vaultConfigurationState(environment) !== "configured") {
		throw new Error("Vault AppRole credentials are not completely configured.");
	}

	const { data, response } = await fetchJsonBounded<unknown>(
		new URL("/v1/auth/approle/login", validateVaultAddress(environment)),
		{
			body: JSON.stringify({
				role_id: environment.VAULT_ROLE_ID,
				secret_id: environment.VAULT_SECRET_ID
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
