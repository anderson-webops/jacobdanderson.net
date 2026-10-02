import assert from "node:assert/strict";
import test from "node:test";
import { externalScriptsMatchPolicy } from "./static-script-policy.mjs";

const integrity = `sha384-${"a".repeat(64)}`;
const analytics = `<script src="https://analytics.jacobdanderson.net/script.js" integrity="${integrity}" crossorigin="anonymous"></script>`;
const local = "<script type=\"module\" src=\"/assets/app.js\"></script>";

test("allows the single integrity-pinned tracker on public pages and no external script on admin", () => {
	assert.equal(externalScriptsMatchPolicy(local + analytics, false), true);
	assert.equal(externalScriptsMatchPolicy(local + analytics.replace("<script src", "<SCRIPT SRC"), false), true);
	assert.equal(externalScriptsMatchPolicy(local, true), true);
	assert.equal(externalScriptsMatchPolicy(local + analytics, true), false);
});

test("rejects uppercase, protocol-relative, data, and SVG external scripts", () => {
	for (const tag of [
		"<SCRIPT SRC=\"https://evil.example/tracker.js\"></SCRIPT>",
		"<script src=//evil.example/tracker.js></script>",
		"<script src=\"data:text/javascript,alert(1)\"></script>",
		"<svg><script href=\"https://evil.example/tracker.js\"></script></svg>"
	]) {
		assert.equal(externalScriptsMatchPolicy(local + analytics + tag, false), false, tag);
	}
});

test("rejects missing integrity, unapproved tracker origins, and duplicate trackers", () => {
	assert.equal(externalScriptsMatchPolicy(local + analytics.replace(/ integrity="[^"]+"/u, ""), false), false);
	assert.equal(externalScriptsMatchPolicy(local + analytics.replace("analytics.jacobdanderson.net", "evil.example"), false), false);
	assert.equal(externalScriptsMatchPolicy(local + analytics + analytics, false), false);
});
