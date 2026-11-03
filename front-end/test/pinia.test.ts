import type { ViteSSGContext } from "vite-ssg";
import { defineStore } from "pinia";
import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { install } from "../src/modules/pinia";

const useFixtureStore = defineStore("upstream-fixture", { state: () => ({ count: 0 }) });

function setup(isClient: boolean, initialState: Record<string, unknown> = {}) {
	const app = createSSRApp({ render: () => h("main") });
	install({ app, isClient, initialState } as ViteSSGContext);
	return { store: app.runWithContext(() => useFixtureStore()), initialState };
}

describe("upstream Pinia SSG context", () => {
	it("serializes server state using the explicit request context", () => {
		const { store, initialState } = setup(false);
		store.count = 17;
		expect(initialState.pinia).toEqual({ "upstream-fixture": { count: 17 } });
	});
	it("hydrates a client from retained initial state", () => {
		const { store } = setup(true, { pinia: { "upstream-fixture": { count: 23 } } });
		expect(store.count).toBe(23);
	});
	it("supports a client without retained state", () => {
		expect(setup(true).store.count).toBe(0);
	});
	it("isolates independent server-rendering requests", () => {
		const first = setup(false);
		const second = setup(false);
		first.store.count = 5;
		expect(second.store.count).toBe(0);
		second.store.count = 9;
		expect(first.initialState.pinia).toEqual({ "upstream-fixture": { count: 5 } });
		expect(second.initialState.pinia).toEqual({ "upstream-fixture": { count: 9 } });
	});
});
