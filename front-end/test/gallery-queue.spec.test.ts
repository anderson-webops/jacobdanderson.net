import { expect, it, vi } from "vitest";
import { requestGalleryImage } from "../src/utils/galleryImages";

it("starts four images together and limits each window to seven starts", async () => {
	vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
	const controller = new AbortController();
	const elements = Array.from({ length: 9 }, () => document.createElement("img"));
	const admitted = (element: HTMLImageElement) => element.hasAttribute("src");
	try {
		const requests = elements.map((element, index) =>
			requestGalleryImage(element, `/image-${index}`, () => true, controller.signal)
		);
		expect(elements.filter(admitted)).toHaveLength(4);
		for (const element of elements.slice(0, 7)) element.dispatchEvent(new Event("load"));
		expect(elements.filter(admitted)).toHaveLength(7);
		await vi.advanceTimersByTimeAsync(1049);
		expect(elements.filter(admitted)).toHaveLength(7);
		await vi.advanceTimersByTimeAsync(1);
		expect(elements.filter(admitted)).toHaveLength(9);
		for (const element of elements.slice(7)) element.dispatchEvent(new Event("load"));
		expect(await Promise.all(requests)).toEqual(Array.from({ length: 9 }).fill("loaded"));
	} finally {
		controller.abort();
		vi.useRealTimers();
	}
});
