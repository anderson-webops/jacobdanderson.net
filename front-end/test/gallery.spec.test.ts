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
		expect(wrapper.get('[aria-label="Favorite: Photo"]').attributes("aria-pressed")).toBe("false");
		await wrapper.get('[aria-label="Favorite: Photo"]').trigger("click");
		await flushPromises();
		expect(adminFetch).toHaveBeenCalledWith(
			`/api/admin/gallery/photos/${photo.id}/favorite`,

			expect.objectContaining({ method: "POST", body: '{"favorite":true}' })
		);
		expect(wrapper.get('[aria-label="Favorite: Photo"]').attributes("aria-pressed")).toBe("true");
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
		await wrapper.get('[aria-label="Favorite: Photo"]').trigger("click");
		await flushPromises();
		expect(wrapper.get('[aria-label="Favorite: Photo"]').attributes("disabled")).toBeDefined();
		await wrapper.get('[role="alert"] button').trigger("click");
		await flushPromises();
		expect(wrapper.get('[aria-label="Favorite: Photo"]').attributes("aria-pressed")).toBe("false");
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

	it.each(["photos", "drawings"] as const)(
		"manages selection, order, hiding and confirmed deletion in %s",
		async gallery => {
			const other = { ...photo, id: "000000000000000000000002", description: "Other" };
			const visible = [photo, other];
			const hidden: typeof visible = [];
			const base = `/api/admin/gallery/${gallery}`;
			vi.stubGlobal(
				"fetch",
				vi.fn(() => response(visible))
			);
			const adminFetch = vi.fn(async (path: string, init?: RequestInit) => {
				if (path === `${base}/hidden`) return response(hidden);
				if (path === `${base}/${photo.id}/move` && init?.body === '{"direction":"later"}') {
					visible.reverse();
				} else if (path === `${base}/${photo.id}/visibility`) {
					if (init?.body === '{"visible":false}') hidden.push(...visible.splice(visible.indexOf(photo), 1));
					else visible.push(...hidden.splice(hidden.indexOf(photo), 1));
				} else if (
					path === `${base}/${photo.id}/delete` &&
					init?.body === JSON.stringify({ confirm: photo.id })
				) {
					hidden.splice(hidden.indexOf(photo), 1);
				} else {
					throw new Error("Unexpected gallery change");
				}
				return new Response(null, { status: 204 });
			});
			const wrapper = mount(GalleryGrid, { props: { gallery, adminFetch: adminFetch as typeof fetch } });
			await flushPromises();
			const click = async (label: string, card?: string) => {
				const area = card ? wrapper.findAll("li").find(item => item.get("strong").text() === card)! : wrapper;
				await area
					.findAll("button")
					.find(button => button.text() === label)!
					.trigger("click");
				await flushPromises();
			};
			await click("Move later", "Photo");
			expect(wrapper.findAll("li strong").map(item => item.text())).toEqual(["Other", "Photo"]);
			await click("Hide from gallery", "Photo");
			expect(wrapper.findAll("li")).toHaveLength(1);
			await click("Hidden");
			expect(wrapper.get("li strong").text()).toBe("Photo");
			expect(wrapper.find("li img").exists()).toBe(false);
			await click("Show in gallery", "Photo");
			expect(wrapper.find("li").exists()).toBe(false);
			await click("Visible");
			await click("Hide from gallery", "Photo");
			await click("Hidden");
			await click("Delete…", "Photo");
			await click("Cancel", "Photo");
			expect(hidden).toEqual([photo]);
			await click("Delete…", "Photo");
			await click("Delete permanently", "Photo");
			expect(hidden).toEqual([]);
			expect(visible).toEqual([other]);
			wrapper.unmount();
		}
	);
});
