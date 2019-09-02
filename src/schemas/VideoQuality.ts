import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("VideoQuality")
export class VideoQuality implements Models.VideoQualityTableRow {
	@Field(() => Int)
	public id: Models.VideoQualityTableRow["id"];

	@Field(() => Int, { nullable: true })
	public height: Models.VideoQualityTableRow["height"];

	@Field(() => Int, { nullable: true })
	public width: Models.VideoQualityTableRow["width"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.VideoQualityTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.VideoQualityTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.VideoQualityTableRow["updatedAt"];

	public videoId: Models.VideoQualityTableRow["videoId"];
	public createdById: Models.VideoQualityTableRow["createdById"];
	public deletedById: Models.VideoQualityTableRow["deletedById"];
	public updatedById: Models.VideoQualityTableRow["updatedById"];
}
