interface CanvasSize {
	width: number;
	height: number;
}

const ratio = (item: CanvasSize) => item.width / item.height;
const roundDown = (pixels: number) => Math.floor(pixels * 64) / 64;

export function galleryRowWidths(items: readonly CanvasSize[], width: number, target: number, gap: number) {
	const widths: number[] = [];
	let start = 0;
	let sum = 0;

	function finish(end: number, cap = Infinity) {
		const height = Math.min(cap, (width - gap * (end - start - 1)) / sum);
		for (let index = start; index < end; index++) widths.push(roundDown(height * ratio(items[index]!)));
		start = end;
		sum = 0;
	}

	if (width <= 0) return widths;
	for (const [index, item] of items.entries()) {
		const aspect = ratio(item);
		const count = index - start;
		const nextHeight = (width - gap * count) / (sum + aspect);
		if (count && nextHeight < target) {
			const currentHeight = (width - gap * (count - 1)) / sum;
			if (aspect * target >= width) finish(index, target);
			else if (currentHeight - target <= target - nextHeight) finish(index);
		}
		sum += aspect;
		if ((width - gap * (index - start)) / sum <= target) finish(index + 1);
	}
	if (start < items.length) finish(items.length, target);
	return widths;
}

export function drawingOpening(
	lead: CanvasSize,
	side: readonly CanvasSize[],
	width: number,
	maxHeight: number,
	gap: number
) {
	const leadAspect = ratio(lead);
	const sideAspects = side.map(ratio);
	if (!side.length) return { stacked: false, widths: [Math.min(width, maxHeight * leadAspect)] };
	const stackAspect = 1 / sideAspects.reduce((sum, aspect) => sum + 1 / aspect, 0);
	const stackHeight = (width - gap + (side.length - 1) * gap * stackAspect) / (leadAspect + stackAspect);
	if (width > 700 && stackHeight <= maxHeight) {
		const leadWidth = roundDown(stackHeight * leadAspect);
		return { stacked: true, widths: [leadWidth, ...side.map(() => width - gap - leadWidth)] };
	}
	const leadOnTop = width <= 700 && width / leadAspect <= maxHeight;
	const aspects = leadOnTop ? sideAspects : [leadAspect, ...sideAspects];
	const height = Math.min(
		maxHeight,
		(width - (aspects.length - 1) * gap) / aspects.reduce((sum, value) => sum + value, 0)
	);
	return {
		stacked: false,
		widths: [...(leadOnTop ? [width] : []), ...aspects.map(aspect => roundDown(height * aspect))]
	};
}
