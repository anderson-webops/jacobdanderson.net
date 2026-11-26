import { Buffer } from "node:buffer";
import { promisify } from "node:util";
import { crc32, createInflate, deflate } from "node:zlib";

export const MAX_SIDE = 1024;
export const PREVIEW_SIDE = 512;
const SIGNATURE = Buffer.from("89504e470d0a1a0a", "hex");
const RGBA_HEADER = Buffer.from([8, 6, 0, 0, 0]);
const compress = promisify(deflate);

function chunk(name: string, data: Buffer) {
	const output = Buffer.alloc(12 + data.length);
	output.writeUInt32BE(data.length);
	output.write(name, 4, 4, "ascii");
	data.copy(output, 8);
	output.writeUInt32BE(crc32(output.subarray(4, -4)), output.length - 4);
	return output;
}

async function encodePng(width: number, height: number, rows: Buffer) {
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width);
	header.writeUInt32BE(height, 4);
	RGBA_HEADER.copy(header, 8);
	return Buffer.concat([SIGNATURE, chunk("IHDR", header), chunk("IDAT", await compress(rows)), chunk("IEND", Buffer.alloc(0))]);
}

function validSide(value: number) {
	return Number.isInteger(value) && value >= 1 && value <= MAX_SIDE;
}

export async function encodePixels(width: number, height: number, pixels: Buffer) {
	if (!validSide(width) || !validSide(height) || pixels.length !== width * height * 4) {
		throw new RangeError("Invalid dimensions");
	}
	const stride = width * 4;
	const rows = Buffer.alloc((stride + 1) * height);
	for (let row = 0; row < height; row++) {
		pixels.copy(rows, row * (stride + 1) + 1, row * stride, (row + 1) * stride);
	}
	return encodePng(width, height, rows);
}

async function sampleRows(compressed: Buffer, width: number, height: number, targetWidth: number, targetHeight: number) {
	const stride = width * 4 + 1;
	const targetStride = targetWidth * 4 + 1;
	const output = Buffer.allocUnsafe(targetStride * targetHeight);
	const scanline = Buffer.allocUnsafe(stride);
	const sums = new Uint32Array(targetWidth * 4);
	const edges = Array.from({ length: targetWidth + 1 }, (_, column) => Math.floor(column * width / targetWidth));
	let buffered = 0;
	let sourceRow = 0;
	let targetRow = 0;
	let top = 0;
	let bottom = Math.floor(height / targetHeight);

	const stream = createInflate();
	stream.end(compressed);
	try {
		for await (const part of stream as AsyncIterable<Buffer>) {
			for (let offset = 0; offset < part.length;) {
				const count = Math.min(stride - buffered, part.length - offset);
				part.copy(scanline, buffered, offset, offset + count);
				offset += count;
				buffered += count;
				if (buffered !== stride) continue;
				if (sourceRow >= height || scanline[0] !== 0) return undefined;
				buffered = 0;

				for (let column = 0; column < targetWidth; column++) {
					const index = column * 4;
					const right = edges[column + 1]! * 4 + 1;
					for (let pixel = edges[column]! * 4 + 1; pixel < right; pixel += 4) {
						const alpha = scanline[pixel + 3]!;
						sums[index] = sums[index]! + scanline[pixel]! * alpha;
						sums[index + 1] = sums[index + 1]! + scanline[pixel + 1]! * alpha;
						sums[index + 2] = sums[index + 2]! + scanline[pixel + 2]! * alpha;
						sums[index + 3] = sums[index + 3]! + alpha;
					}
				}

				if (++sourceRow === bottom) {
					writePreviewRow(output, targetRow * targetStride, sums, edges, bottom - top);
					sums.fill(0);
					top = bottom;
					targetRow++;
					bottom = Math.floor((targetRow + 1) * height / targetHeight);
				}
			}
		}
	}
	catch {
		return undefined;
	}
	return targetRow === targetHeight && buffered === 0 ? output : undefined;
}

function writePreviewRow(target: Buffer, offset: number, sums: Uint32Array, edges: number[], sourceRows: number) {
	target[offset++] = 1;
	const previous = [0, 0, 0, 0];
	for (let column = 0; column < edges.length - 1; column++) {
		const index = column * 4;
		const alpha = sums[index + 3]!;
		const samples = (edges[column + 1]! - edges[column]!) * sourceRows;
		for (let channel = 0; channel < 4; channel++) {
			const value = channel === 3 ? Math.round(alpha / samples) : alpha ? Math.round(sums[index + channel]! / alpha) : 0;
			target[offset++] = value - previous[channel]!;
			previous[channel] = value;
		}
	}
}

export async function createPreview(png: Buffer) {
	if (png.length < 57 || !png.subarray(0, 8).equals(SIGNATURE)
		|| png.readUInt32BE(8) !== 13 || png.toString("ascii", 12, 16) !== "IHDR"
		|| !png.subarray(24, 29).equals(RGBA_HEADER) || png.toString("ascii", 37, 41) !== "IDAT") {
		return png;
	}
	const width = png.readUInt32BE(16);
	const height = png.readUInt32BE(20);
	const length = png.readUInt32BE(33);
	if (!validSide(width) || !validSide(height) || png.length !== length + 57
		|| png.readUInt32BE(length + 45) !== 0 || png.toString("ascii", length + 49, length + 53) !== "IEND") {
		return png;
	}
	const largestSide = Math.max(width, height);
	if (largestSide <= PREVIEW_SIDE) return png;

	const targetWidth = Math.max(1, Math.round(width * PREVIEW_SIDE / largestSide));
	const targetHeight = Math.max(1, Math.round(height * PREVIEW_SIDE / largestSide));
	const rows = await sampleRows(png.subarray(41, 41 + length), width, height, targetWidth, targetHeight);
	if (!rows) return png;
	const preview = await encodePng(targetWidth, targetHeight, rows);
	return preview.length < png.length ? preview : png;
}
