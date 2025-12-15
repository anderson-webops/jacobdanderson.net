import { api } from "@/api";
import { useAppStore } from "@/stores/app";

type EditableKind = "user" | "tutor" | "admin";

export function useEditable(kind: EditableKind) {
	const app = useAppStore();
	const lastEmail = ref(app.currentUser?.email ?? null);

	async function save(entity: any) {
		if (kind === "user") {
			const emailChanged =
				lastEmail.value !== null && entity.email !== lastEmail.value;

			if (emailChanged) {
				await api.post(`/accounts/changeEmail/${entity._id}`, {
					email: entity.email
				});
			}

			await api.put(`/users/user/${entity._id}`, entity);
			app.setCurrentUser(entity);
			lastEmail.value = entity.email;
			return;
		}

		if (kind === "tutor") {
			await api.put(`/tutors/${entity._id}`, entity);
			app.setCurrentTutor(entity);
			return;
		}

		await api.put(`/admins/${entity._id}`, entity);
		app.setCurrentAdmin(entity);
	}

	return {
		save
	};
}
