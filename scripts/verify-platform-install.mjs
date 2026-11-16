import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { nodeIdentity, verifyReusableToolchain } from "./build-toolchain-cache.mjs";

const root = process.cwd();
if (!process.env.npm_execpath) throw new Error("Run platform qualification through the selected locked npm profile.");
const npmExecPath = await realpath(process.env.npm_execpath);
const npmPrefix = path.resolve(path.dirname(npmExecPath), "../../..");
if (npmExecPath !== path.join(npmPrefix, "node_modules/npm/bin/npm-cli.js")) {
	throw new Error("Platform qualification requires the locked profile's npm JavaScript entrypoint.");
}
const receipt = verifyReusableToolchain(npmPrefix, nodeIdentity());
if (
	process.version !== "v26.13.1"
	|| receipt.node !== "26.13.1"
	|| receipt.versions.npm !== "12.2.2"
	|| receipt.profile !== "webops-locked-npm-v1"
	|| receipt.lockSha256 !== "87f602703478c129d228479cd4638f46e36057fd9299d214090057ca75d74bde"
	|| receipt.payloadTreeSha256 !== "266bb8045b5fd0c689010b9b1b1ec44a489147607836dc583243087e23fcc7b8"
) {
	throw new Error("Platform qualification requires the exact reviewed Node 26.13.1/npm 12.2.2 SDK.");
}
const frontendManifest = JSON.parse(await readFile(path.join(root, "front-end/package.json"), "utf8"));

function run(command, args, cwd) {
	return new Promise((resolve, reject) => {
		const environment = { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" };
		delete environment.npm_config_global_ignore_file;
		delete environment.NPM_CONFIG_GLOBAL_IGNORE_FILE;
		const child = spawn(command, args, {
			cwd,
			env: environment,
			stdio: "inherit"
		});
		child.once("error", reject);
		child.once("exit", code => (code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))));
	});
}

async function packageInstalled(temporaryRoot, dependency) {
	for (const prefix of ["node_modules", "front-end/node_modules"]) {
		try {
			await readFile(path.join(temporaryRoot, prefix, dependency, "package.json"), "utf8");
			return true;
		}
		catch {
			// Try the other valid workspace location.
		}
	}
	return false;
}

async function verifyTarget(libc) {
	const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), `jacobdanderson-linux-arm64-${libc}-`));
	try {
		await Promise.all([
			mkdir(path.join(temporaryRoot, "back-end"), { recursive: true }),
			mkdir(path.join(temporaryRoot, "front-end"), { recursive: true })
		]);
		await Promise.all([
			cp(path.join(root, "package.json"), path.join(temporaryRoot, "package.json")),
			cp(path.join(root, "package-lock.json"), path.join(temporaryRoot, "package-lock.json")),
			cp(path.join(root, ".npmrc"), path.join(temporaryRoot, ".npmrc")),
			cp(path.join(root, "back-end/package.json"), path.join(temporaryRoot, "back-end/package.json")),
			cp(path.join(root, "front-end/package.json"), path.join(temporaryRoot, "front-end/package.json"))
		]);
		await run(
			process.execPath,
			[
				npmExecPath,
				"ci",
				"--ignore-scripts",
				"--include=optional",
				"--no-audit",
				"--no-fund",
				"--os=linux",
				"--cpu=arm64",
				`--libc=${libc}`
			],
			temporaryRoot
		);

		const expected = Object.keys(frontendManifest.optionalDependencies || {}).filter((dependency) => {
			if (dependency === "@esbuild/linux-arm64") return true;
			return dependency.includes("linux-arm64") && dependency.endsWith(libc === "musl" ? "-musl" : "-gnu");
		});
		const missing = [];
		for (const dependency of expected) {
			if (!(await packageInstalled(temporaryRoot, dependency))) missing.push(dependency);
		}
		if (missing.length) {
			throw new Error(`Linux ARM64 ${libc} install omitted native packages: ${missing.join(", ")}`);
		}
		process.stdout.write(`Verified Linux ARM64 ${libc} clean install (${expected.length} native packages).\n`);
	}
	finally {
		await rm(temporaryRoot, { force: true, recursive: true });
	}
}

await verifyTarget("glibc");
await verifyTarget("musl");
