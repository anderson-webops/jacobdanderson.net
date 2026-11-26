import { describe, expect, it } from "vitest";
import { drawingOpening, galleryRowWidths } from "../src/utils/galleryLayout";

const wide = { width: 2, height: 1 };
const tall = { width: 1, height: 2 };
const landscape = { width: 3, height: 2 };

describe("gallery placement", () => {
	it("fits a mixed row edge to edge in source order, leaving a sparse final row at reading size", () => {
		const batch = [wide, tall, landscape];
		const widths = galleryRowWidths(batch, 1000, 250, 10);
		expect(widths).toEqual([490, 122.5, 367.5]);
		expect(galleryRowWidths([...batch, tall], 1000, 250, 10)).toEqual([...widths, 125]);
	});

	it("gives an extra-wide canvas its own row without enlarging the preceding portrait", () => {
		const panorama = { width: 10, height: 1 };
		expect(galleryRowWidths([tall, panorama, tall], 400, 120, 8)).toEqual([60, 400, 60]);
		expect(galleryRowWidths([tall], 0, 120, 8)).toEqual([]);
	});

	it("packs a lead drawing beside both supports with matching outer edges", () => {
		const { stacked, widths } = drawingOpening(wide, [tall, wide], 1200, 800, 12);
		expect(stacked).toBe(true);
		const [lead, first, second] = widths as [number, number, number];
		expect(lead + 12 + first).toBe(1200);
		expect(first).toBe(second);
		expect(lead / 2).toBeCloseTo(first * 2 + 12 + second / 2, 1);
	});

	it("keeps a landscape lead above a proportional pair on mobile and tall groups together", () => {
		const mobile = drawingOpening(wide, [tall, wide], 380, 600, 8);
		expect(mobile.stacked).toBe(false);
		expect(mobile.widths[0]).toBe(380);
		expect(mobile.widths[1]! + 8 + mobile.widths[2]!).toBeCloseTo(380, 1);
		expect(mobile.widths[1]! * 4).toBeCloseTo(mobile.widths[2]!, 1);
		expect(drawingOpening(tall, [tall, tall], 1200, 700, 12)).toEqual({ stacked: false, widths: [350, 350, 350] });
		expect(drawingOpening(tall, [], 1000, 600, 12).widths).toEqual([300]);
	});
});
