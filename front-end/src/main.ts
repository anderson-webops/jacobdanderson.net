import type { RouteRecordRaw } from "vue-router";
import type { GallerySite } from "./config/gallerySites";
import type { UserModule } from "~/types.ts";
import { setupLayouts } from "virtual:generated-layouts";
import { ViteSSG } from "vite-ssg";

import { routes } from "vue-router/auto-routes";
import App from "./App.vue";
import { installAnalyticsPrivacy, isAdministrationRoute } from "./config/analytics";
import { GALLERY_SITES, galleryDocumentPath, galleryOrigin } from "./config/gallerySites";
import { installAnalyticsPageviews } from "./utils/analytics";
import { installSsgHeadBridge } from "./utils/ssgHead";
// Assuming you have styles defined in these files
import "@unocss/reset/tailwind.css";
import "./styles/main.css";
import "uno.css";

const currentGallerySite = import.meta.env.SSR
	? undefined
	: GALLERY_SITES.find(site => site.hostname === window.location.hostname);

function standaloneGalleryRoute(site: GallerySite, admin = false, standalone = false): RouteRecordRaw {
	const base = standalone ? "" : galleryDocumentPath(site);
	return {
		path: admin ? `${base}/admin` : base || "/",
		component: admin ? () => import("./pages/admin.vue") : () => import("./components/GalleryPage.vue"),
		props: admin ? { collection: site.gallery } : { gallery: site.gallery, standalone: true },
		meta: {
			layout: "default",
			wideGallery: !admin,
			standaloneGallery: true,
			galleryCanonicalUrl: `${galleryOrigin(site)}/${admin ? "admin" : ""}`,
			title: admin ? `Manage ${site.gallery} | Jacob Anderson` : site.title,
			description: admin ? `Manage ${site.gallery}.` : site.description,
			...(admin ? { robots: "noindex,nofollow" } : {})
		}
	};
}

const appRoutes = currentGallerySite
	? [standaloneGalleryRoute(currentGallerySite, false, true), standaloneGalleryRoute(currentGallerySite, true, true)]
	: [
			...routes,
			...(import.meta.env.SSR
				? GALLERY_SITES.flatMap(site => [standaloneGalleryRoute(site), standaloneGalleryRoute(site, true)])
				: [])
		];

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
	App,
	{
		routes: setupLayouts(appRoutes),
		base: import.meta.env.BASE_URL,
		scrollBehavior(to, _from, savedPosition) {
			if (savedPosition) return savedPosition;
			// Offset clears the sticky header.
			if (to.hash) return { el: to.hash, top: 88 };

			return { left: 0, top: 0 };
		}
	},
	ctx => {
		if (ctx.isClient && !currentGallerySite) {
			const adminDocument = /^\/admin\/?$/iu.test(window.location.pathname);
			ctx.router.beforeEach(to => {
				if (isAdministrationRoute(to) === adminDocument) return true;
				const destination = new URL(to.fullPath, window.location.origin);
				if (destination.origin === window.location.origin)
					window.location.assign(isAdministrationRoute(to) ? "/admin" : destination.href);
				return false;
			});
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
