const ACTOR_PATTERN = /^[\w.@+-]{1,80}$/;
const REQUEST_ID_PATTERN = /^[\w.:-]{16,128}$/;

export const PROJECT_ADMIN_ACTOR_HEADER = "x-portfolio-admin-actor";
export const PROJECT_ADMIN_REQUEST_ID_HEADER = "x-portfolio-request-id";

export interface ProjectAdminAuditContext {
	actor: string;
	requestId: string;
}

export function parseProjectAdminAuditContext(
	actor: string | undefined,
	requestId: string | undefined
): ProjectAdminAuditContext | null {
	if (!actor || !ACTOR_PATTERN.test(actor) || !requestId || !REQUEST_ID_PATTERN.test(requestId)) return null;
	return { actor, requestId };
}
