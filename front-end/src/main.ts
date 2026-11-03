import type { UserModule } from "~/types.ts";
import { setupLayouts } from "virtual:generated-layouts";
import { ViteSSG } from "vite-ssg";

import { routes } from "vue-router/auto-routes";
import App from "./App.vue";
import { installAnalyticsPrivacy } from "./config/analytics";
import { installAnalyticsPageviews } from "./utils/analytics";
import { installSsgHeadBridge } from "./utils/ssgHead";
// Assuming you have styles defined in these files
import "@unocss/reset/tailwind.css";
import "./styles/main.css";
import "uno.css";

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
	App,
	{
		routes: setupLayouts([...routes]),
		base: import.meta.env.BASE_URL,
		scrollBehavior(to, _from, savedPosition) {
			if (savedPosition) return savedPosition;
			// Offset clears the sticky header.
			if (to.hash) return { el: to.hash, top: 88 };

			return { left: 0, top: 0 };
		}
	},
	ctx => {
		if (ctx.isClient) {
			installAnalyticsPrivacy(window);
			ctx.app.onUnmount(installAnalyticsPageviews(ctx.router, window));
		}
		installSsgHeadBridge(ctx);
		Object.values(
			import.meta.glob<{
				install: UserModule;
			}>("./modules/*.ts", { eager: true })
		).forEach(i => i.install?.(ctx));
	},
	{ useHead: false }
);
