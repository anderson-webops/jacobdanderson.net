import type { Router } from "vue-router";
import { isAdministrationRoute } from "../config/analytics";

export type AnalyticsWindow = Window & {
	umami?: { track: (payload: (defaults: Record<string, unknown>) => Record<string, unknown>) => unknown };
};

export function installAnalyticsPageviews(router: Router, target: AnalyticsWindow) {
	let pending: { url: string; referrer: string } | undefined;
	let timer: number | undefined;
	function flush() {
		target.clearTimeout(timer);
		timer = target.setTimeout(() => {
			if (!pending || !target.umami || isAdministrationRoute(router.currentRoute.value)) return;
			const page = pending;
			pending = undefined;
			target.umami.track(defaults => ({ ...defaults, ...page, title: target.document.title }));
		}, 0);
	}
	const removeHook = router.afterEach((to, from, failure) => {
		if (failure) return;
		pending = isAdministrationRoute(to)
			? undefined
			: {
					url: new URL(to.fullPath, "https://jacobdanderson.net").href,
					referrer: from.matched.length
						? new URL(from.fullPath, "https://jacobdanderson.net").href
						: target.document.referrer
				};
		flush();
	});
	target.addEventListener("load", flush, true);
	return () => {
		removeHook();
		target.removeEventListener("load", flush, true);
		target.clearTimeout(timer);
	};
}
