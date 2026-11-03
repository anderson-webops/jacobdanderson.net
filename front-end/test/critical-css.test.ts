import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCriticalCssRenderer } from "../scripts/critical-css.mts";

let directory: string;
const stylesheet = ".projects{color:red}.contact{color:blue}.dialog{display:grid}";
beforeEach(async () => {
	const root = resolve("../.ai-work/runs/critical-css");
	await mkdir(root, { recursive: true });
	directory = await mkdtemp(`${root}/fixture-`);
	await writeFile(resolve(directory, "styles.css"), stylesheet);
});
afterEach(async () => {
	if (directory) await rm(directory, { recursive: true });
});
function documentFor(className: string) {
	return `<!doctype html><html><head><title>Portfolio</title><link rel="stylesheet" href="/styles.css"><style>.interactive{display:grid}</style><script defer src="/app.js"></script></head><body><main class="${className}">Projects</main></body></html>`;
}
describe("modern critical CSS", () => {
	it("keeps complete styles, dynamic rules and script identity", async () => {
		const html = await createCriticalCssRenderer(directory)(documentFor("projects"));
		const document = new DOMParser().parseFromString(html, "text/html");
		expect(html).toContain(".projects{color:red}");
		expect(html).toContain(".interactive{display:grid}");
		expect(await readFile(resolve(directory, "styles.css"), "utf8")).toBe(stylesheet);
		expect(document.body.querySelector('link[rel="stylesheet"]')?.getAttribute("href")).toBe("/styles.css");
		expect([...document.querySelectorAll("script")].every(script => Boolean(script.src))).toBe(true);
		expect(
			[...document.querySelectorAll("*")].some(element =>
				[...element.attributes].some(attribute => /^on/iu.test(attribute.name))
			)
		).toBe(false);
	});
	it("isolates parallel route processing", async () => {
		const render = createCriticalCssRenderer(directory);
		const [projects, contact] = await Promise.all([
			render(documentFor("projects")),
			render(documentFor("contact"))
		]);
		expect(projects).toContain(".projects{color:red}");
		expect(projects).not.toContain(".contact{");
		expect(contact).toContain(".contact{color:blue}");
		expect(contact).not.toContain(".projects{");
	});
	it("fails repeated missing-stylesheet attempts", async () => {
		const render = createCriticalCssRenderer(directory);
		for (const attempt of [1, 2]) {
			await expect(
				render(documentFor("projects").replace("/styles.css", "/missing.css")),
				`attempt ${attempt}`
			).rejects.toThrow("Critical CSS generation failed");
		}
	});
});
