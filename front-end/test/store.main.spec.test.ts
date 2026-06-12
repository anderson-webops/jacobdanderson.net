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
		expect(store.userProfile.lastUpdated).toBe("June 2026");
		expect(store.userProfile.skills.languages).toContain("C");
		expect(store.userProfile.skills.frameworks).not.toContain("Vitesse");
	});

	it("featuredEngineeringExperience returns engineering entries only", () => {
		const store = useMainStore();

		expect(store.featuredEngineeringExperience).toHaveLength(3);
		expect(store.featuredEngineeringExperience.every(item => item.category === "engineering")).toBe(true);
		expect(store.featuredEngineeringExperience[0].title).toContain("Researcher");
	});

	it("instructionExperience keeps teaching as a first-class track", () => {
		const store = useMainStore();

		expect(store.instructionExperience).toHaveLength(1);
		expect(store.instructionExperience[0].organization).toBe("Juni Learning");
	});

	it("featuredProjects returns two items and reflects state changes", () => {
		const store = useMainStore();

		expect(store.featuredProjects).toHaveLength(2);

		store.userProfile.projects.unshift({
			name: "New Embedded Toolkit",
			timeframe: "2025",
			description: "Placeholder project to verify getter reactivity.",
			role: "Test entry",
			results: ["Smoke-test entry for featuredProjects"],
			links: []
		});

		expect(store.featuredProjects[0].name).toBe("New Embedded Toolkit");
		expect(store.featuredProjects).toHaveLength(2);
	});
});
