import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("production route surface", () => {
	it("does not ship the removed starter demo route", () => {
		expect(existsSync(resolve(process.cwd(), "src/pages/hi/[name].vue"))).toBe(false);
	});

	it("keeps the expected public pages in source", () => {
		for (const page of [
			"index.vue",
			"about.vue",
			"experience.vue",
			"projects.vue",
			"classes.vue",
			"contact.vue",
			"resume.vue"
		]) {
			expect(existsSync(resolve(process.cwd(), "src/pages", page))).toBe(true);
		}
	});

	it("ships the downloadable professional résumé", () => {
		const resumePath = resolve(process.cwd(), "public/resume/jacob-anderson-resume.pdf");

		expect(existsSync(resumePath)).toBe(true);
		expect(readFileSync(resumePath).subarray(0, 5).toString()).toBe("%PDF-");
	});
});
