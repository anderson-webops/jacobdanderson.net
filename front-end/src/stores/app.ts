import { acceptHMRUpdate, defineStore } from "pinia";
import { api } from "@/api";

interface SessionUser {
	_id: string;
	name: string;
	email: string;
	age?: number;
	state?: string;
}

type SessionTutor = SessionUser;

type SessionAdmin = SessionUser & {
	editAdmins?: boolean;
	saveEdit?: string;
};

export const useAppStore = defineStore("app", () => {
	const loginBlock = ref(false);
	const currentUser = ref<SessionUser | null>(null);
	const currentTutor = ref<SessionTutor | null>(null);
	const currentAdmin = ref<SessionAdmin | null>(null);

	function setLoginBlock(show: boolean) {
		loginBlock.value = show;
	}

	function setCurrentUser(user: SessionUser | null) {
		currentUser.value = user;
	}

	function setCurrentTutor(tutor: SessionTutor | null) {
		currentTutor.value = tutor;
	}

	function setCurrentAdmin(admin: SessionAdmin | null) {
		currentAdmin.value = admin;
	}

	function clearSession() {
		setCurrentUser(null);
		setCurrentTutor(null);
		setCurrentAdmin(null);
	}

	async function bootstrapSession() {
		try {
			const { data } = await api.get("/accounts/me");

			if (data?.adminID) {
				const response = await api.get("/admins/loggedin");
				setCurrentAdmin(response.data?.currentAdmin ?? null);
				setCurrentUser(null);
				setCurrentTutor(null);
				return;
			}

			if (data?.tutorID) {
				const response = await api.get("/tutors/loggedin");
				setCurrentTutor(response.data?.currentTutor ?? null);
				setCurrentUser(null);
				setCurrentAdmin(null);
				return;
			}

			if (data?.userID) {
				const response = await api.get("/users/loggedin");
				setCurrentUser(response.data?.currentUser ?? null);
				setCurrentTutor(null);
				setCurrentAdmin(null);
				return;
			}

			clearSession();
			// eslint-disable-next-line unused-imports/no-unused-vars
		} catch (err) {
			clearSession();
		}
	}

	return {
		loginBlock,
		currentUser,
		currentTutor,
		currentAdmin,
		setLoginBlock,
		setCurrentUser,
		setCurrentTutor,
		setCurrentAdmin,
		bootstrapSession,
		clearSession
	};
});

if (import.meta.hot) {
	import.meta.hot.accept(
		acceptHMRUpdate(useAppStore as any, import.meta.hot)
	);
}
