import type { OtherProject } from "~/data/otherProjects";
import { ref } from "vue";
import { otherProjects } from "~/data/otherProjects";

interface VisibilityItem {
	slug: string;
	visible: boolean;
}

interface VisibilityResponse {
	items: VisibilityItem[];
}

const projectSlugs = new Set(otherProjects.map(project => project.slug));

function isVisibilityResponse(value: unknown): value is VisibilityResponse {
	if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) return false;
	if (value.items.length > projectSlugs.size) return false;

	const seen = new Set<string>();
	for (const item of value.items) {
		if (
			!item ||
			typeof item !== "object" ||
			!("slug" in item) ||
			typeof item.slug !== "string" ||
			!projectSlugs.has(item.slug) ||
			seen.has(item.slug) ||
			!("visible" in item) ||
			typeof item.visible !== "boolean"
		) {
			return false;
		}
		seen.add(item.slug);
	}

	return true;
}

export function useProjectVisibility() {
	const errorMessage = ref("");
	const hasLoadedVisibility = ref(false);
	const isLoading = ref(false);
	const overrides = ref<Record<string, boolean>>({});

	function isProjectVisible(project: OtherProject): boolean {
		return overrides.value[project.slug] ?? project.defaultVisible;
	}

	async function loadVisibility(): Promise<boolean> {
		isLoading.value = true;
		errorMessage.value = "";
		hasLoadedVisibility.value = false;
		overrides.value = {};

		try {
			const response = await fetch("/api/projects/visibility", {
				credentials: "same-origin",
				headers: { Accept: "application/json" }
			});
			if (!response.ok) throw new Error("Project visibility is unavailable.");

			const payload: unknown = await response.json();
			if (!isVisibilityResponse(payload)) throw new Error("Project visibility returned an invalid response.");

			overrides.value = Object.fromEntries(payload.items.map(item => [item.slug, item.visible]));
			hasLoadedVisibility.value = true;
			return true;
		} catch {
			errorMessage.value =
				"Project visibility is unavailable. Nothing is shown until the settings can be loaded.";
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	async function setProjectVisibility(project: OtherProject, visible: boolean): Promise<boolean> {
		errorMessage.value = "";
		if (!hasLoadedVisibility.value) {
			errorMessage.value = "Load the saved visibility settings before making a change.";
			return false;
		}

		try {
			const response = await fetch(`/api/admin/projects/${encodeURIComponent(project.slug)}`, {
				body: JSON.stringify({ visible }),
				credentials: "same-origin",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json"
				},
				method: "PATCH"
			});
			if (!response.ok) throw new Error("Project visibility could not be saved.");

			overrides.value = { ...overrides.value, [project.slug]: visible };
			return true;
		} catch {
			errorMessage.value = "The visibility change was not saved. Confirm that protected admin access is enabled.";
			return false;
		}
	}

	return {
		errorMessage,
		hasLoadedVisibility,
		isLoading,
		isProjectVisible,
		loadVisibility,
		setProjectVisibility
	};
}
