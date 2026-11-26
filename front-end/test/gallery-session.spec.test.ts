import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, expect, it, vi } from "vitest";
import AdminPage from "../src/pages/admin.vue";
import { probeAdminGateway } from "../src/utils/adminGateway";

vi.mock("../src/utils/adminGateway", () => ({ probeAdminGateway: vi.fn() }));
afterEach(() => vi.unstubAllGlobals());

it("uses the server session for edits and revokes it on sign-out", async () => {
	const csrf = "fixture".repeat(6);
	vi.mocked(probeAdminGateway).mockResolvedValue({ mode: "session", csrf });
	const photo = { id: "000000000000000000000001", width: 1, height: 1, description: "Light" };
	const fetcher = vi.fn((url: string) =>
		url === "/api/gallery/photos"
			? new Response(JSON.stringify({ items: [photo], next: null }))
			: new Response(null, { status: 204 })
	);
	vi.stubGlobal("fetch", fetcher);
	const wrapper = mount(AdminPage, { props: { collection: "photos" } });
	await flushPromises();
	expect(wrapper.find("input[type=password]").exists()).toBe(false);
	await wrapper.get('[aria-label="Favorite: Light"]').trigger("click");
	await flushPromises();
	const write = (fetcher.mock.calls as unknown as [string, RequestInit][]).find(([url]) => url.endsWith("/favorite"));
	expect(write?.[1]).toMatchObject({ credentials: "same-origin", mode: "same-origin", redirect: "error" });
	expect(new Headers(write?.[1].headers).get("X-Portfolio-CSRF")).toBe(csrf);
	expect(new Headers(write?.[1].headers).has("Authorization")).toBe(false);
	expect(fetcher).toHaveBeenCalledWith("/api/gallery/photos", expect.objectContaining({ credentials: "omit" }));
	await wrapper
		.findAll("button")
		.find(button => button.text() === "Sign out")!
		.trigger("click");
	await flushPromises();
	expect(fetcher).toHaveBeenCalledWith(
		"/api/admin/logout",
		expect.objectContaining({ method: "POST", credentials: "same-origin", headers: { "X-Portfolio-CSRF": csrf } })
	);
	expect(wrapper.get("a").attributes("href")).toBe("/api/admin/login");
	expect(wrapper.find(".workspace").exists()).toBe(false);
	wrapper.unmount();
});
