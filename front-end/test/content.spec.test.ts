import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { afterEach, describe, expect, it, vi } from "vitest";
import About from "../src/pages/about.vue";
import Admin from "../src/pages/admin.vue";
import Classes from "../src/pages/classes.vue";
import Contact from "../src/pages/contact.vue";
import Experience from "../src/pages/experience.vue";
import Home from "../src/pages/index.vue";
import OtherProjects from "../src/pages/other-projects.vue";
import Projects from "../src/pages/projects.vue";
import Resume from "../src/pages/resume.vue";

const global = {
	plugins: [createPinia()],
	stubs: { RouterLink: { props: ["to"], template: '<a :href="to"><slot /></a>' } }
};

afterEach(() => vi.unstubAllGlobals());

describe("focused public content", () => {
	it.each([
		["Home", Home, 320],
		["About", About, 250],
		["Experience", Experience, 500],
		["Projects", Projects, 300],
		["Teaching", Classes, 260],
		["Contact", Contact, 115],
		["Résumé", Resume, 760]
	] as const)("keeps %s within its reading budget", (_name, page, budget) => {
		const wrapper = mount(page, { global });
		expect(wrapper.findAll("h1")).toHaveLength(1);
		expect(wrapper.text().split(/\s+/).length).toBeLessThanOrEqual(budget);
		wrapper.unmount();
	});

	it("leads Home with the current role without duplicating the experience list", () => {
		const wrapper = mount(Home, { global });
		expect(wrapper.get("h1").text()).toBe("Patent Technical Specialist");
		expect(wrapper.text()).toContain("under attorney supervision");
		expect(wrapper.text()).toContain("Expected May 2027");
		expect(wrapper.text()).not.toContain("Start here");
		expect(wrapper.findAll(".experience-entry")).toHaveLength(0);
		expect(wrapper.findAll(".glance dl > div")).toHaveLength(3);
		expect(wrapper.findAll(".feature-card")).toHaveLength(2);
		expect(wrapper.get(".feature-card a").attributes("href")).toBe("/projects#oscre-circuit-simulation");
		wrapper.unmount();
	});

	it("keeps role highlights one click away, with the current role open", () => {
		const wrapper = mount(Experience, { global });
		const disclosures = wrapper.findAll(".experience-entry details");
		expect(disclosures.length).toBeGreaterThan(1);
		expect(wrapper.get(".current-entry details").attributes("open")).toBeDefined();
		expect(disclosures.filter(details => details.attributes("open") !== undefined)).toHaveLength(1);
		expect(wrapper.findAll("summary").every(summary => summary.attributes("tabindex") === "0")).toBe(true);
		wrapper.unmount();
	});

	it("gives each selected project a stable anchor for deep links", () => {
		const wrapper = mount(Projects, { global });
		expect(wrapper.findAll(".project-card").map(card => card.attributes("id"))).toEqual([
			"oscre-circuit-simulation",
			"industrial-drill-monitoring",
			"glucose-monitoring-research",
			"stride-device-concept"
		]);
		wrapper.unmount();
	});

	it("keeps elementary language proficiency separate from working proficiency", () => {
		const wrapper = mount(Resume, { global });
		expect(wrapper.get(".working-languages").text()).toContain("Spanish (professional working)");
		expect(wrapper.get(".working-languages").text()).not.toContain("elementary");
		expect(wrapper.get(".elementary-languages").text()).toBe("French (elementary), Russian (elementary)");
		wrapper.unmount();
	});

	it("retains lesson subjects, pricing, consultation, and billing terms", () => {
		const wrapper = mount(Classes, { global });
		for (const phrase of [
			"math",
			"$40",
			"50-minute",
			"Free consultation",
			"Missed or canceled sessions are not billed"
		]) {
			expect(wrapper.text()).toContain(phrase);
		}
		expect(wrapper.findAll("ol li")).toHaveLength(3);
		wrapper.unmount();
	});

	it("keeps email primary and patent-related work bounded on Contact", () => {
		const wrapper = mount(Contact, { global });
		expect(wrapper.get(".button-primary").attributes("href")).toBe("mailto:jacob@jacobdanderson.net");
		expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false);
		expect(wrapper.text()).toContain("under attorney supervision");
		wrapper.unmount();
	});
});

describe("visibility page states", () => {
	it("keeps cards hidden after a failed load and recovers on retry", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(new Response("{}", { status: 503 }))
				.mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ slug: "oscre", visible: false }] })))
		);
		const wrapper = mount(OtherProjects, { global });
		await flushPromises();
		expect(wrapper.findAll(".project-card")).toHaveLength(0);
		expect(wrapper.get('[role="alert"]').text()).toContain("Please try again");
		await wrapper.get(".retry-button").trigger("click");
		await flushPromises();
		expect(wrapper.findAll(".project-card")).toHaveLength(30);
		expect(wrapper.findAll(".project-card").some(card => card.text().includes("OSCRE"))).toBe(false);
		await wrapper
			.findAll(".filter-button")
			.find(button => button.text() === "Software & games")!
			.trigger("click");
		expect(wrapper.findAll(".project-card")).toHaveLength(3);
		wrapper.unmount();
	});

	it("makes admin save failures recoverable and labels both eye states", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(new Response('{"items":[]}'))
				.mockRejectedValueOnce(new TypeError("lost response"))
				.mockResolvedValueOnce(new Response('{"items":[{"slug":"oscre","visible":false}]}'))
		);
		const wrapper = mount(Admin, { global });
		await flushPromises();
		await wrapper.get('button[aria-label="Hide OSCRE Circuit Simulation"]').trigger("click");
		await flushPromises();
		expect(wrapper.get('[role="alert"]').text()).toContain("Couldn’t confirm");
		expect(wrapper.findAll(".visibility-button").every(button => button.attributes("disabled") !== undefined)).toBe(
			true
		);
		await wrapper.get(".retry-button").trigger("click");
		await flushPromises();
		expect(wrapper.get('button[aria-label="Show OSCRE Circuit Simulation"]').attributes("aria-pressed")).toBe(
			"false"
		);
		expect(wrapper.find('[role="alert"]').exists()).toBe(false);
		wrapper.unmount();
	});
});
