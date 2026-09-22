import { afterEach, describe, expect, it, vi } from "vitest";
import { useProjectVisibility } from "../src/composables/useProjectVisibility";
import { otherProjects } from "../src/data/otherProjects";

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status
	});
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("project visibility client", () => {
	it("loads a bounded valid response before exposing project defaults", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				jsonResponse({
					items: [{ slug: "oscre", visible: false }]
				})
			)
		);
		const visibility = useProjectVisibility();
		const oscre = otherProjects.find(project => project.slug === "oscre");
		expect(oscre).toBeDefined();
		expect(visibility.hasLoadedVisibility.value).toBe(false);

		expect(await visibility.loadVisibility()).toBe(true);
		expect(visibility.hasLoadedVisibility.value).toBe(true);
		expect(visibility.isProjectVisible(oscre!)).toBe(false);
	});

	it.each([429, 503])("fails closed on an HTTP %i response", async status => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => jsonResponse({ ok: false }, status))
		);
		const visibility = useProjectVisibility();

		expect(await visibility.loadVisibility()).toBe(false);
		expect(visibility.hasLoadedVisibility.value).toBe(false);
		expect(visibility.errorMessage.value).toContain("Nothing is shown");
	});

	it("fails closed on network and invalid-payload errors", async () => {
		const fetchMock = vi
			.fn()
			.mockRejectedValueOnce(new TypeError("network failed"))
			.mockResolvedValueOnce(jsonResponse({ items: [{ slug: "unknown-project", visible: true }] }))
			.mockResolvedValueOnce(jsonResponse({ items: [{ slug: "oscre", visible: true }] }));
		vi.stubGlobal("fetch", fetchMock);
		const visibility = useProjectVisibility();

		expect(await visibility.loadVisibility()).toBe(false);
		expect(visibility.hasLoadedVisibility.value).toBe(false);
		expect(await visibility.loadVisibility()).toBe(false);
		expect(visibility.hasLoadedVisibility.value).toBe(false);
		expect(await visibility.loadVisibility()).toBe(true);
		expect(visibility.hasLoadedVisibility.value).toBe(true);
		expect(fetchMock).toHaveBeenCalledTimes(3);
	});

	it("refuses mutations until the saved state has loaded", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const visibility = useProjectVisibility();

		expect(await visibility.setProjectVisibility(otherProjects[0]!, false)).toBe(false);
		expect(fetchMock).not.toHaveBeenCalled();
		expect(visibility.errorMessage.value).toContain("before making a change");
	});
});
