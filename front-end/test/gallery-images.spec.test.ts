import { flushPromises, mount } from "@vue/test-utils";
import { expect, it, vi } from "vitest";
import GalleryImage from "../src/components/GalleryImage.vue";

it("stops retrying after the third image failure", async () => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
	const url = "/api/gallery/photos/000000000000000000000001";
	const wrapper = mount(GalleryImage, { props: { url, alt: "Test photo", width: 4, height: 2, immediate: true } });
	try {
		expect(wrapper.attributes("src")).toBe(url);
		expect(wrapper.attributes("alt")).toBe("");
		for (const delay of [750, 2000]) {
			await wrapper.trigger("error");
			await flushPromises();
			expect(wrapper.attributes("src")).toBeUndefined();
			await vi.advanceTimersByTimeAsync(delay - 1);
			expect(wrapper.attributes("src")).toBeUndefined();
			await vi.advanceTimersByTimeAsync(1);
			expect(wrapper.attributes("src")).toBe(url);
		}
		await wrapper.trigger("error");
		await flushPromises();
		await vi.advanceTimersByTimeAsync(30_000);
		expect(wrapper.attributes("src")).toBeUndefined();
		expect(wrapper.attributes("alt")).toBe("");
		expect(wrapper.classes()).toContain("pending");
	} finally {
		wrapper.unmount();
		vi.useRealTimers();
	}
});
