import type { AnalyticsWindow } from "../src/utils/analytics";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import { filterAnalyticsPayload, isAdministrationRoute } from "../src/config/analytics";
import { installAnalyticsPageviews } from "../src/utils/analytics";

const router = createRouter({
	history: createMemoryHistory(),
	routes: [
		{ path: "/admin", alias: "/private-console", component: {} },
		{ path: "/:pathMatch(.*)*", component: {} }
	]
});

describe("private analytics boundaries", () => {
	it("sends one public pageview per navigation, excludes admin and waits for the provider", async () => {
		const localRouter = createRouter({
			history: createMemoryHistory(),
			routes: [
				{ path: "/admin", component: {} },
				{ path: "/:pathMatch(.*)*", component: {} }
			]
		});
		const target: AnalyticsWindow = window;
		const previous = target.umami;
		const track = vi.fn();
		delete target.umami;
		const dispose = installAnalyticsPageviews(localRouter, target);
		try {
			await localRouter.push("/projects");
			await new Promise(resolve => setTimeout(resolve, 10));
			expect(track).not.toHaveBeenCalled();
			target.umami = { track };
			target.dispatchEvent(new Event("load"));
			await vi.waitFor(() => expect(track).toHaveBeenCalledTimes(1));
			await localRouter.push("/admin");
			target.dispatchEvent(new Event("load"));
			await new Promise(resolve => setTimeout(resolve, 10));
			expect(track).toHaveBeenCalledTimes(1);
			await localRouter.push("/contact");
			await vi.waitFor(() => expect(track).toHaveBeenCalledTimes(2));
			const payload = track.mock.calls[1][0]({ website: "fixture" });
			expect(filterAnalyticsPayload("event", payload)).toEqual({
				website: "fixture",
				url: "https://jacobdanderson.net/contact",
				referrer: "",
				title: document.title
			});
			target.dispatchEvent(new Event("load"));
			await new Promise(resolve => setTimeout(resolve, 10));
			expect(track).toHaveBeenCalledTimes(2);
		} finally {
			dispose();
			target.umami = previous;
		}
	});
	it.each(["/admin", "/admin/", "/ADMIN", "/ADMIN/", "/admin?next=projects", "/private-console"])(
		"recognizes the administration route %s",
		path => {
			expect(isAdministrationRoute(router.resolve(path))).toBe(true);
		}
	);
	it.each(["/", "/projects", "/administrator"])("preserves public tracking for %s", path => {
		expect(isAdministrationRoute(router.resolve(path))).toBe(false);
	});
	it.each(["/admin", "/ADMIN/", "/api/projects", "https://jacobdanderson.net/admin?private=value"])(
		"filters private collector payloads for %s",
		url => {
			expect(filterAnalyticsPayload("event", { url })).toBeUndefined();
		}
	);
	it("removes private referrers without changing public payloads", () => {
		const payload = { url: "/projects", referrer: "/ADMIN/", title: "Projects" };
		expect(filterAnalyticsPayload("event", payload)).toEqual({ ...payload, referrer: "" });
		expect(payload.referrer).toBe("/ADMIN/");
		const publicPayload = { url: "/contact", referrer: "/projects" };
		expect(filterAnalyticsPayload("event", publicPayload)).toBe(publicPayload);
	});
});
