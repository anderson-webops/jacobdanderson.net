import assert from "node:assert/strict";
import { Buffer } from "node:buffer";

export function editorFixture(gallery, firstId, pixel) {
	const size = gallery === "photos" ? 24 : 12;
	const images = Array.from({ length: size + 9 }, (_, index) => ({
		id: index ? (index + 100).toString(16).padStart(24, "0") : firstId,
		description: index ? `Frame ${index}` : `Fixture ${gallery}`,
		width: 4,
		height: 2
	}));
	const requests = [];
	const changes = [];
	const base = `/api/gallery/${gallery}`;
	const admin = `/api/admin/gallery/${gallery}/`;
	async function serve(req, res, url) {
		if (url.pathname === base) {
			const cursor = url.searchParams.get("before");
			requests.push(cursor);
			const start = cursor === null ? 0 : images.findIndex(item => item.id === cursor) + 1;
			const items = images.slice(start, start + size);
			res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
			res.end(JSON.stringify({ items, next: start + size < images.length ? items.at(-1).id : null }));
		}
		else if (url.pathname.startsWith(`${base}/`)) {
			res.writeHead(200, { "content-type": "image/png" });
			res.end(pixel);
		}
		else if (url.pathname.startsWith(admin) && req.method === "POST") {
			assert.ok(req.headers.authorization);
			const [id, action] = url.pathname.slice(admin.length).split("/");
			const chunks = [];
			for await (const chunk of req) chunks.push(chunk);
			const payload = JSON.parse(Buffer.concat(chunks).toString());
			const item = images.find(image => image.id === id);
			if (action === "move") {
				images.splice(images.indexOf(item), 1);
				const index = images.findIndex(image => image.id === payload.targetId);
				images.splice(index + Number(payload.placement === "after"), 0, item);
			}
			else if (action === "favorite") {
				assert.equal(payload.favorite, true);
				item.favorite = true;
				images.splice(images.indexOf(item), 1);
				images.unshift(item);
			}
			else if (action === "rename") {
				item.description = payload.description;
			}
			else {
				throw new Error("Unexpected editor mutation");
			}
			changes.push({ id, action, payload });
			res.writeHead(204);
			res.end();
		}
		else {
			return false;
		}
		return true;
	}
	return { images, requests, changes, size, serve };
}

export async function checkEditor(page, state, mobile) {
	const cards = ".gallery li[data-item]";
	const ids = () => page.$$eval(cards, nodes => nodes.map(node => node.dataset.item));
	const [source, target] = state.images;
	const card = id => `[data-item="${id}"]`;
	assert.equal((await ids()).length, state.size);
	assert.equal(await page.$(".gallery details"), null);
	assert.ok(!await page.$eval(".gallery", node => /More (?:photos|drawings)/i.test(node.textContent)));
	await page.$eval(card(source.id), node => node.scrollIntoView({ block: "start", behavior: "instant" }));
	const [from, to] = await page.evaluate((source, target, mobile) => {
		const grip = document.querySelector(`[data-item="${source}"] .grip`).getBoundingClientRect();
		const card = document.querySelector(`[data-item="${target}"]`).getBoundingClientRect();
		return [{ x: grip.left + grip.width / 2, y: grip.top + grip.height / 2 }, { x: card.left + card.width * 0.75, y: card.top + card.height * (mobile ? 0.68 : 0.4) }];
	}, source.id, target.id, mobile);
	if (mobile) {
		const client = await page.createCDPSession();
		for (const [type, point] of [["touchStart", from], ["touchMove", { x: from.x - 8, y: from.y + 9 }], ["touchMove", to], ["touchEnd", null]]) {
			await client.send("Input.dispatchTouchEvent", { type, touchPoints: point ? [point] : [] });
		}
		await client.detach();
	}
	else {
		await page.mouse.move(from.x, from.y);
		await page.mouse.down();
		await page.mouse.move(to.x, to.y, { steps: 8 });
		await page.mouse.up();
	}
	await page.waitForFunction((cards, id) => document.querySelector(cards)?.dataset.item === id, {}, cards, target.id);
	assert.deepEqual(state.changes, [{ id: source.id, action: "move", payload: { targetId: target.id, placement: "after" } }]);
	const priorPages = state.requests.filter(Boolean).length;
	await page.$eval(".gallery .sentinel", node => node.scrollIntoView({ block: "center", behavior: "instant" }));
	await page.waitForFunction((cards, n) => document.querySelectorAll(cards).length === n, {}, cards, state.images.length);
	assert.equal(state.requests.filter(Boolean).length - priorPages, 1);
	const deep = state.images[state.size + 3];
	await page.$eval(card(deep.id), node => node.scrollIntoView({ block: "center", behavior: "instant" }));
	const top = await page.evaluate(() => scrollY);
	assert.ok(top > 500);
	await page.$eval(`${card(deep.id)} .star`, (node) => {
		node.focus({ preventScroll: true });
		node.click();
	});
	await page.waitForFunction((cards, id) => document.querySelector(cards)?.dataset.item === id && !document.querySelector(".star").disabled, {}, cards, deep.id);
	assert.ok(Math.abs(top - await page.evaluate(() => scrollY)) < 4, "Favoriting moved the viewport");
	assert.notEqual(await page.evaluate(() => document.activeElement.closest("[data-item]")?.dataset.item), deep.id);
	const title = `${card(source.id)} .name`;
	await page.click(title);
	await page.type(`${card(source.id)} input`, "Evening light");
	await page.keyboard.press("Enter");
	await page.waitForFunction(selector => document.querySelector(selector)?.textContent === "Evening light", {}, title);
	assert.equal(state.changes.filter(change => change.action === "rename").length, 1);
	await page.click("[data-visitor]");
	await page.waitForSelector(".visitor-preview .photo-tile");
	assert.equal(await page.$eval(".workspace", node => node.getClientRects().length), 0);
	await page.click("[data-editor]");
	assert.equal((await ids()).length, state.images.length);
}
