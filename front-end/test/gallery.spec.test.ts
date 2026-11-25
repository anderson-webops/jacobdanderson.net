import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import GalleryGrid from "../src/components/GalleryGrid.vue";
import { fetchGalleryPage } from "../src/utils/gallery";

const photo = { id: "000000000000000000000001", description: "Photo", width: 320, height: 160 };
const response = (items: unknown[]) => new Response(JSON.stringify({ items, next: null }));

afterEach(() => vi.unstubAllGlobals());

describe("photo favorites", () => {
	it("saves favorites and refreshes their persisted state", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(response([photo]))
				.mockResolvedValueOnce(response([{ ...photo, favorite: true }]))
		);
		const adminFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
		const wrapper = mount(GalleryGrid, { props: { gallery: "photos", adminFetch } });
		await flushPromises();
		expect(wrapper.get("button").attributes("aria-pressed")).toBe("false");
		await wrapper.get("button").trigger("click");
		await flushPromises();
		expect(adminFetch).toHaveBeenCalledWith(
			`/api/admin/gallery/photos/${photo.id}/favorite`,

			expect.objectContaining({ method: "POST", body: '{"favorite":true}' })
		);
		expect(wrapper.get("button").attributes("aria-pressed")).toBe("true");
		wrapper.unmount();
	});

	it("keeps the previous state until a failed write is refreshed", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValueOnce(response([{ ...photo, favorite: true }]))
				.mockResolvedValueOnce(response([photo]))
		);
		const adminFetch = vi.fn().mockRejectedValue(new Error("Response lost"));
		const wrapper = mount(GalleryGrid, { props: { gallery: "photos", adminFetch } });
		await flushPromises();
		await wrapper.get("button").trigger("click");
		await flushPromises();
		expect(wrapper.get('[aria-pressed="true"]').attributes("disabled")).toBeDefined();
		await wrapper.get('[role="alert"] button').trigger("click");
		await flushPromises();
		expect(wrapper.get("button").attributes("aria-pressed")).toBe("false");
		wrapper.unmount();
	});

	it("keeps the 24-photo and 12-drawing limits separate", async () => {
		const photos = Array.from({ length: 24 }, (_, index) => ({
			...photo,
			id: String(index + 1).padStart(24, "0")
		}));
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(() => response(photos))
		);
		await expect(fetchGalleryPage("photos")).resolves.toMatchObject({ items: photos });
		await expect(fetchGalleryPage("drawings")).rejects.toThrow("Invalid gallery response");
	});
});
