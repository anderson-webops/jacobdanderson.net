import assert from "node:assert/strict";
import test from "node:test";
import { verifyNativeLock } from "./verify-native-lock.mjs";

const binding = "@fixture/linux-arm64";
function fixture() {
	return { packages: {
		"front-end": { optionalDependencies: { [binding]: "1.0.0" } },
		"front-end/node_modules/tool": { optionalDependencies: { [binding]: "2.0.0" } },
		[`front-end/node_modules/${binding}`]: { version: "2.0.0" }
	} };
}
test("native inventory follows actual consumers rather than stale workspace declarations", () => {
	assert.equal(verifyNativeLock(fixture(), { optionalDependencies: { [binding]: "2.0.0" } }), 1);
	assert.throws(() => verifyNativeLock(fixture(), { optionalDependencies: { [binding]: "1.0.0" } }), /does not match/u);
});
test("native inventory rejects missing and unconsumed bindings", () => {
	const lock = fixture();
	delete lock.packages[`front-end/node_modules/${binding}`];
	assert.throws(() => verifyNativeLock(lock, {}), /Missing deploy-target/u);
	assert.throws(() => verifyNativeLock(fixture(), { optionalDependencies: { "@orphan/linux-x64": "1.0.0" } }), /Unconsumed/u);
});
test("workspace declarations alone cannot masquerade as a native consumer", () => {
	assert.throws(() => verifyNativeLock({ packages: { "front-end": { optionalDependencies: { [binding]: "1.0.0" } } } }, {}), /No deploy-target/u);
});
