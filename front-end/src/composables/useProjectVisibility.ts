import type { OtherProject } from "~/data/otherProjects";
import { ref } from "vue";

interface VisibilityItem {
	slug: string;
	visible: boolean;
}

interface VisibilityResponse {
	items: VisibilityItem[];
}

function isVisibilityResponse(value: unknown): value is VisibilityResponse {
	if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) return false;

	return value.items.every(
		item =>
			Boolean(item) &&
			typeof item === "object" &&
			"slug" in item &&
			typeof item.slug === "string" &&
			"visible" in item &&
			typeof item.visible === "boolean"
	);
}

export function useProjectVisibility() {
	const errorMessage = ref("");
	const isLoading = ref(false);
	const overrides = ref<Record<string, boolean>>({});

	function isProjectVisible(project: OtherProject): boolean {
		return overrides.value[project.slug] ?? project.defaultVisible;
	}

	async function loadVisibility(): Promise<boolean> {
		isLoading.value = true;
		errorMessage.value = "";

		try {
			const response = await fetch("/api/projects/visibility", {
				credentials: "same-origin",
				headers: { Accept: "application/json" }
			});
			if (!response.ok) throw new Error("Project visibility is unavailable.");

			const payload: unknown = await response.json();
			if (!isVisibilityResponse(payload)) throw new Error("Project visibility returned an invalid response.");

			overrides.value = Object.fromEntries(payload.items.map(item => [item.slug, item.visible]));
			return true;
		} catch {
			errorMessage.value = "Saved visibility settings could not be loaded. Default settings are shown.";
			return false;
		} finally {
			isLoading.value = false;
		}
	}

	async function setProjectVisibility(project: OtherProject, visible: boolean): Promise<boolean> {
		errorMessage.value = "";

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
		isLoading,
		isProjectVisible,
		loadVisibility,
		setProjectVisibility
	};
}
