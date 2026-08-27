import { describe, expect, it } from "vitest";
import { otherProjectCategories, otherProjects } from "../src/data/otherProjects";

describe("other project inventory", () => {
	it("uses unique stable slugs and source-safe links", () => {
		const slugs = otherProjects.map(project => project.slug);
		const links = otherProjects.flatMap(project => project.links);

		expect(otherProjects.length).toBeGreaterThanOrEqual(25);
		expect(new Set(slugs).size).toBe(slugs.length);
		expect(slugs.every(slug => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))).toBe(true);
		expect(links.every(link => link.href.startsWith("https://"))).toBe(true);
	});

	it("covers each curated category and public GitHub organization", () => {
		for (const category of otherProjectCategories) {
			expect(otherProjects.some(project => project.category === category)).toBe(true);
		}

		const linkTargets = otherProjects.flatMap(project => project.links.map(link => link.href)).join("\n");
		expect(linkTargets).toContain("github.com/Jacoba1100254352");
		expect(linkTargets).toContain("github.com/anderson-webops");
		expect(linkTargets).toContain("github.com/instruction-material");
		expect(linkTargets).toContain("github.com/byu-ecen427-classroom");
	});

	it("keeps Stride public copy bounded to the project record", () => {
		const stride = otherProjects.find(project => project.slug === "stride");
		const copy = JSON.stringify(stride);

		expect(stride?.timeframe).toBe("2025 – 2026");
		expect(copy).not.toMatch(/limbo|silent contacts|hear back|restart|paused/i);
	});
});
