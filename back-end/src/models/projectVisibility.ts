import type { Model } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface ProjectVisibilityRecord {
	slug: string;
	updatedAt: string;
	visible: boolean;
}

interface ProjectVisibilityDocument {
	createdAt: Date;
	slug: string;
	updatedAt: Date;
	visible: boolean;
}

const projectVisibilitySchema = new Schema<ProjectVisibilityDocument>(
	{
		slug: {
			match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			maxlength: 80,
			required: true,
			trim: true,
			type: String,
			unique: true
		},
		visible: { required: true, type: Boolean }
	},
	{
		collection: "project_visibility",
		timestamps: true,
		versionKey: false
	}
);

const ProjectVisibility = (
	mongoose.models.ProjectVisibility as Model<ProjectVisibilityDocument> | undefined
) ?? mongoose.model<ProjectVisibilityDocument>("ProjectVisibility", projectVisibilitySchema);

function toRecord(document: ProjectVisibilityDocument): ProjectVisibilityRecord {
	return {
		slug: document.slug,
		updatedAt: document.updatedAt.toISOString(),
		visible: document.visible
	};
}

export async function listProjectVisibility(): Promise<ProjectVisibilityRecord[]> {
	const documents = await ProjectVisibility.find({}).sort({ slug: 1 }).exec();
	return documents.map(toRecord);
}

export async function setProjectVisibility(slug: string, visible: boolean): Promise<ProjectVisibilityRecord> {
	const document = await ProjectVisibility.findOneAndUpdate(
		{ slug },
		{ $set: { visible } },
		{ new: true, setDefaultsOnInsert: true, upsert: true }
	).exec();
	if (!document) throw new Error("Project visibility update returned no record.");
	return toRecord(document);
}
