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
		expect(store.userProfile.location).toBe("Atlanta Metropolitan Area");
		expect(store.userProfile.lastUpdated).toBe("August 2026");
		expect(store.userProfile.headline).toContain("Patent Technical Specialist");
		expect(store.userProfile.skills.languages).toContain("C");
		expect(store.userProfile.skills.frameworks).not.toContain("Vitesse");
	});

	it("featuredProfessionalExperience leads with patent work and keeps technical roles", () => {
		const store = useMainStore();

		expect(store.featuredProfessionalExperience).toHaveLength(3);
		expect(store.featuredProfessionalExperience[0]).toMatchObject({
			category: "patent",
			organization: "Meunier Carlin & Curfman LLC",
			title: "Patent Technical Specialist"
		});
		expect(
			store.featuredProfessionalExperience.every(
				item => item.category === "patent" || item.category === "engineering"
			)
		).toBe(true);
	});

	it("instructionExperience keeps teaching as a first-class track", () => {
		const store = useMainStore();

		expect(store.instructionExperience).toHaveLength(2);
		expect(store.instructionExperience[0].organization).toBe("Classes with Jacob");
		expect(store.instructionExperience[1]).toMatchObject({
			organization: "Juni Learning",
			timeframe: "Jun 2021 – Nov 2025"
		});
	});

	it("keeps ended roles historical", () => {
		const store = useMainStore();
		const stride = store.userProfile.experience.find(item => item.organization === "Stride");

		expect(stride?.timeframe).toBe("Sep 2025 – Aug 2026");
		expect(stride?.timeframe).not.toContain("Present");
	});

	it("uses stable professional links and contact details", () => {
		const store = useMainStore();
		const profileHrefs = store.userProfile.profiles.map(item => item.href);

		expect(store.userProfile.email).toBe("jacob@jacobdanderson.net");
		expect(new Set(profileHrefs).size).toBe(profileHrefs.length);
		expect(profileHrefs.filter(href => !href.startsWith("/")).every(href => href.startsWith("https://"))).toBe(
			true
		);
		expect(profileHrefs).toContain("https://www.linkedin.com/in/jacoba1100254352/");
	});

	it("qualifies academic claims to the available records", () => {
		const store = useMainStore();
		const graduateEducation = store.userProfile.education[0];

		expect(graduateEducation.institution).toContain("Georgia Institute of Technology");
		expect(graduateEducation.timeframe).toContain("Expected May 2027");
		expect(graduateEducation.highlights[0]).toBe("Graduate GPA 3.50 through Spring 2026.");
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
