import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const compiledServer = path.join(repositoryRoot, "back-end/dist/server.js");
await import(compiledServer);

const childEnvironment = { ...process.env };
for (const name of [
	"ENABLE_INTERNAL_DIAGNOSTICS",
	"INTERNAL_DIAGNOSTICS_KEY",
	"MONGODB_URI",
	"VAULT_ADDR",
	"VAULT_ROLE_ID",
	"VAULT_SECRET_ID"
]) {
	delete childEnvironment[name];
}

const result = await new Promise((resolve, reject) => {
	const child = spawn(process.execPath, [compiledServer], {
		cwd: repositoryRoot,
		env: childEnvironment,
		stdio: ["ignore", "pipe", "pipe"]
	});
	let output = "";
	child.stdout.on("data", chunk => (output += chunk.toString()));
	child.stderr.on("data", chunk => (output += chunk.toString()));
	const timeout = setTimeout(() => {
		child.kill("SIGKILL");
		reject(new Error("Compiled backend did not fail closed without database credentials."));
	}, 5_000);
	timeout.unref();
	child.once("error", reject);
	child.once("exit", (code) => {
		clearTimeout(timeout);
		resolve({ code, output });
	});
});

if (result.code !== 1) throw new Error(`Expected fail-closed exit code 1, received ${result.code}.`);
if (!/Backend startup failed: Error/.test(result.output)) {
	throw new Error("Compiled backend did not report a categorized startup failure.");
}
if (/mongodb(?:\+srv)?:\/\/|VAULT_SECRET_ID|password/i.test(result.output)) {
	throw new Error("Compiled backend startup output exposed sensitive configuration.");
}

process.stdout.write("Backend runtime smoke ok: compiled modules load and missing credentials fail closed.\n");
