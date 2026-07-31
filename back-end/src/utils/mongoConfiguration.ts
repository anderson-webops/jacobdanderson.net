import { env } from "node:process";
import { readMongoSecret, vaultConfigurationState } from "../vaultClient.js";

export interface MongoConfiguration {
	source: "env" | "vault";
	uri: string;
}

type VaultReader = (environment: NodeJS.ProcessEnv) => Promise<{ uri: string }>;

function validMongoUri(value: string | undefined): string {
	const uri = (value || "").trim();
	if (!/^mongodb(?:\+srv)?:\/\//.test(uri) || /[\r\n]/.test(uri)) {
		throw new Error("MongoDB configuration must provide a valid MongoDB URI.");
	}
	return uri;
}

export async function resolveMongoConfiguration(
	environment: NodeJS.ProcessEnv = env,
	readFromVault: VaultReader = readMongoSecret
): Promise<MongoConfiguration> {
	const vaultState = vaultConfigurationState(environment);
	if (vaultState === "incomplete") {
		throw new Error("VAULT_ROLE_ID and VAULT_SECRET_ID must be configured together.");
	}

	if (vaultState === "configured") {
		const secret = await readFromVault(environment);
		return { source: "vault", uri: validMongoUri(secret.uri) };
	}

	if (!environment.MONGODB_URI) {
		throw new Error("No MongoDB URI available (Vault and MONGODB_URI missing).");
	}
	return { source: "env", uri: validMongoUri(environment.MONGODB_URI) };
}
