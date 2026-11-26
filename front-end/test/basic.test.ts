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
			"admin.vue",
			"experience.vue",
			"other-projects.vue",
			"projects.vue",
			"classes.vue",
			"contact.vue",
			"resume.vue"
		]) {
			expect(existsSync(resolve(process.cwd(), "src/pages", page))).toBe(true);
		}
	});

	it("keeps supplemental pages and admin controls out of primary navigation", () => {
		const header = readFileSync(resolve(process.cwd(), "src/components/TheHeader.vue"), "utf8");
		const footer = readFileSync(resolve(process.cwd(), "src/components/TheFooter.vue"), "utf8");
		const projects = readFileSync(resolve(process.cwd(), "src/pages/projects.vue"), "utf8");
		const admin = readFileSync(resolve(process.cwd(), "src/pages/admin.vue"), "utf8");

		expect(header).not.toContain('path: "/other-projects"');
		expect(header).not.toContain('path: "/extra"');
		expect(header).not.toContain('path: "/admin"');
		expect(footer).not.toContain('to: "/other-projects"');
		expect(footer).not.toContain('to: "/admin"');
		expect(projects).toContain('to="/other-projects"');
		expect(projects).toContain('to="/extra"');
		expect(footer).toContain('to="/extra"');
		expect(admin).toContain('autocomplete="current-password"');
		const signInForm = admin.match(/<form\s[^>]+>/)?.[0];
		expect(signInForm).toContain('method="post"');
		expect(signInForm).toContain('action="/admin"');
	});

	it("ships the downloadable professional résumé", () => {
		const resumePath = resolve(process.cwd(), "public/resume/jacob-anderson-resume.pdf");

		expect(existsSync(resumePath)).toBe(true);
		expect(readFileSync(resumePath).subarray(0, 5).toString()).toBe("%PDF-");
	});
});
