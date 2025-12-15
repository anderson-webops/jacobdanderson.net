import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useMainStore } from "../src/stores";

describe("useMainStore", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it("exposes baseline profile details", () => {
		const store = useMainStore();

		expect(store.userProfile.name).toBe("Jacob Anderson");
		expect(store.userProfile.location).toContain("GA");
		expect(store.userProfile.skills.languages).toContain("C");
	});

	it("featuredExperience returns the first three entries", () => {
		const store = useMainStore();

		expect(store.featuredExperience).toHaveLength(3);
		expect(store.featuredExperience[0].title).toContain("Instructor");
		expect(store.featuredExperience[0].organization).toBe(
			"Juni Learning"
		);
	});

	it("featuredProjects returns two items and reflects state changes", () => {
		const store = useMainStore();

		expect(store.featuredProjects).toHaveLength(2);

		store.userProfile.projects.unshift({
			name: "New Embedded Toolkit",
			timeframe: "2025",
			description: "Placeholder project to verify getter reactivity.",
			highlights: ["Smoke-test entry for featuredProjects"]
		});

		expect(store.featuredProjects[0].name).toBe("New Embedded Toolkit");
		expect(store.featuredProjects).toHaveLength(2);
	});
});
