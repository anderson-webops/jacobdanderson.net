import { afterEach, expect, it, vi } from "vitest";
import { probeAdminGateway } from "../src/utils/adminGateway";

afterEach(() => vi.unstubAllGlobals());
const signal = new AbortController().signal;
it("contacts only the three exact HTTPS origins and keeps the session token in memory", async () => {
	const csrf = "a".repeat(40);
	const fetcher = vi.fn(
		() => new Response(null, { status: 204, headers: { "X-Portfolio-Auth": "session", "X-Portfolio-CSRF": csrf } })
	);
	vi.stubGlobal("fetch", fetcher);
	for (const origin of [
		"https://pictures.jacobdanderson.net",
		"http://photos.jacobdanderson.net",
		"https://other.jacobdanderson.net",
		"https://jacobdanderson.net:444"
	]) {
		expect(await probeAdminGateway(origin, signal)).toEqual({ mode: "basic" });
	}
	expect(fetcher).not.toHaveBeenCalled();
	for (const origin of [
		"https://jacobdanderson.net",
		"https://photos.jacobdanderson.net",
		"https://drawings.jacobdanderson.net"
	]) {
		expect(await probeAdminGateway(origin, signal)).toEqual({ mode: "session", csrf });
	}
	expect(fetcher).toHaveBeenCalledWith(
		"/api/admin/session",
		expect.objectContaining({ credentials: "same-origin", redirect: "error", cache: "no-store" })
	);
});
it("requires an explicit gateway and a valid mutation token", async () => {
	const fetcher = vi.fn();
	vi.stubGlobal("fetch", fetcher);
	for (const [status, marker, mode] of [
		[404, "", "basic"],
		[403, "session", "login"],
		[204, "session", "unavailable"],
		[204, "", "unavailable"],
		[503, "", "unavailable"]
	] as const) {
		fetcher.mockResolvedValueOnce(new Response(null, { status, headers: { "X-Portfolio-Auth": marker } }));
		expect(await probeAdminGateway("https://jacobdanderson.net", signal)).toEqual({ mode });
	}
});
