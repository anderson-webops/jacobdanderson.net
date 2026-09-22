import type { Collection, Db } from "mongodb";
import type { ProjectSlug } from "../projectCatalog.js";
import { randomUUID } from "node:crypto";
import { PROJECT_SLUGS } from "../projectCatalog.js";

const DEFAULT_OPERATION_TIMEOUT_MS = 1_500;
const VISIBILITY_COLLECTION = "project_visibility";
const AUDIT_COLLECTION = "project_visibility_audit";

interface ProjectVisibilityDocument {
	createdAt: Date;
	slug: ProjectSlug;
	updatedAt: Date;
	visible: boolean;
}

type AuditOutcome = "attempted" | "failed" | "succeeded" | "unchanged";
type AuditPhase = "attempt" | "result";

interface ProjectVisibilityAuditDocument {
	actor: string;
	eventId: string;
	occurredAt: Date;
	outcome: AuditOutcome;
	phase: AuditPhase;
	previousVisible: boolean | null;
	requestId: string;
	requestedVisible: boolean;
	resultingVisible: boolean | null;
	slug: ProjectSlug;
}

export interface ProjectVisibilityRecord {
	slug: ProjectSlug;
	updatedAt: string;
	visible: boolean;
}

export interface ProjectVisibilityMutation {
	actor: string;
	requestId: string;
	slug: ProjectSlug;
	visible: boolean;
}

export interface ProjectVisibilityStore {
	ensureIndexes: () => Promise<void>;
	list: () => Promise<ProjectVisibilityRecord[]>;
	set: (mutation: ProjectVisibilityMutation) => Promise<ProjectVisibilityRecord>;
}

function toRecord(document: Pick<ProjectVisibilityDocument, "slug" | "updatedAt" | "visible">): ProjectVisibilityRecord {
	return {
		slug: document.slug,
		updatedAt: document.updatedAt.toISOString(),
		visible: document.visible
	};
}

async function recordAudit(
	collection: Collection<ProjectVisibilityAuditDocument>,
	mutation: ProjectVisibilityMutation,
	phase: AuditPhase,
	outcome: AuditOutcome,
	previousVisible: boolean | null,
	resultingVisible: boolean | null,
	timeoutMS: number
) {
	await collection.insertOne(
		{
			actor: mutation.actor,
			eventId: randomUUID(),
			occurredAt: new Date(),
			outcome,
			phase,
			previousVisible,
			requestId: mutation.requestId,
			requestedVisible: mutation.visible,
			resultingVisible,
			slug: mutation.slug
		},
		{ timeoutMS }
	);
}

export function createProjectVisibilityStore(
	database: Db,
	operationTimeoutMS = DEFAULT_OPERATION_TIMEOUT_MS
): ProjectVisibilityStore {
	const visibility = database.collection<ProjectVisibilityDocument>(VISIBILITY_COLLECTION);
	const audit = database.collection<ProjectVisibilityAuditDocument>(AUDIT_COLLECTION);

	return {
		async ensureIndexes() {
			await Promise.all([
				visibility.createIndex({ slug: 1 }, { name: "project_visibility_slug", unique: true }),
				audit.createIndex(
					{ requestId: 1, phase: 1 },
					{ name: "project_visibility_audit_request_phase", unique: true }
				),
				audit.createIndex({ occurredAt: 1 }, { name: "project_visibility_audit_occurred_at" })
			]);
		},
		async list() {
			const documents = await visibility
				.find(
					{ slug: { $in: [...PROJECT_SLUGS] } },
					{
						projection: { _id: 0, slug: 1, updatedAt: 1, visible: 1 },
						timeoutMS: operationTimeoutMS
					}
				)
				.sort({ slug: 1 })
				.limit(PROJECT_SLUGS.length)
				.toArray();
			return documents.map(toRecord);
		},
		async set(mutation) {
			const previous = await visibility.findOne(
				{ slug: mutation.slug },
				{
					projection: { _id: 0, slug: 1, updatedAt: 1, visible: 1 },
					timeoutMS: operationTimeoutMS
				}
			);
			const previousVisible = previous?.visible ?? null;
			await recordAudit(
				audit,
				mutation,
				"attempt",
				"attempted",
				previousVisible,
				previousVisible,
				operationTimeoutMS
			);

			try {
				const now = new Date();
				const document = await visibility.findOneAndUpdate(
					{ slug: mutation.slug },
					{
						$set: { updatedAt: now, visible: mutation.visible },
						$setOnInsert: { createdAt: now, slug: mutation.slug }
					},
					{
						projection: { _id: 0, slug: 1, updatedAt: 1, visible: 1 },
						returnDocument: "after",
						timeoutMS: operationTimeoutMS,
						upsert: true
					}
				);
				if (!document) throw new Error("Project visibility update returned no record.");
				await recordAudit(
					audit,
					mutation,
					"result",
					previousVisible === document.visible ? "unchanged" : "succeeded",
					previousVisible,
					document.visible,
					operationTimeoutMS
				);
				return toRecord(document);
			}
			catch (error) {
				try {
					await recordAudit(
						audit,
						mutation,
						"result",
						"failed",
						previousVisible,
						previousVisible,
						operationTimeoutMS
					);
				}
				catch {
					// The attempt event is already durable. Preserve the original failure.
				}
				throw error;
			}
		}
	};
}
