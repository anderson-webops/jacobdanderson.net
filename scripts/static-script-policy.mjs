import { parse } from "parse5";
import { TRACKER_FILTER, TRACKER_INTEGRITY, TRACKER_KEY, TRACKER_URL } from "../front-end/src/config/analytics.ts";

const siteOrigin = "https://jacobdanderson.net";

export function externalScriptsMatchPolicy(html, adminPage) {
	const pending = [parse(html)];
	const externalScripts = [];
	while (pending.length) {
		const node = pending.pop();
		if (node.tagName === "script") {
			const attributes = new Map(node.attrs.map(attribute => [attribute.name, attribute.value]));
			if (attributes.has("href")) return false;
			const source = attributes.get("src");
			if (source !== undefined) {
				let external = false;
				try {
					external = new URL(source, siteOrigin).origin !== siteOrigin;
				}
				catch {
					external = true;
				}
				if (external) externalScripts.push(attributes);
			}
		}
		pending.push(...(node.childNodes ?? []));
		if (node.content) pending.push(node.content);
	}
	if (adminPage) return externalScripts.length === 0;
	if (externalScripts.length !== 1) return false;
	const attributes = externalScripts[0];
	return attributes.get("src") === TRACKER_URL
		&& attributes.get("integrity") === TRACKER_INTEGRITY
		&& attributes.get("data-hid") === TRACKER_KEY
		&& attributes.get("data-before-send") === TRACKER_FILTER
		&& attributes.get("data-auto-track") === "false"
		&& attributes.get("crossorigin") === "anonymous";
}
