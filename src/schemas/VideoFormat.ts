import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("VideoFormat")
export class VideoFormat implements Models.VideoFormatTableRow {
	@Field(() => Int)
	public id: Models.VideoFormatTableRow["id"];

	@Field(() => String, { nullable: true })
	public name: Models.VideoFormatTableRow["name"];

	@Field(() => String, { nullable: true })
	public url: Models.VideoFormatTableRow["url"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.VideoFormatTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.VideoFormatTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.VideoFormatTableRow["updatedAt"];

	public videoQualityId: Models.VideoFormatTableRow["videoQualityId"];
	public createdById: Models.VideoFormatTableRow["createdById"];
	public deletedById: Models.VideoFormatTableRow["deletedById"];
	public updatedById: Models.VideoFormatTableRow["updatedById"];
}
