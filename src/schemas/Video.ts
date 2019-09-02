import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Video implements Models.VideoTableRow {
	@Field(() => Int)
	public id: Models.VideoTableRow["id"];

	@Field(() => String, { nullable: true })
	public name: Models.VideoTableRow["name"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.VideoTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.VideoTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.VideoTableRow["updatedAt"];

	public courseClassId: Models.VideoTableRow["courseClassId"];
	public position: Models.VideoTableRow["position"];
	public createdById: Models.VideoTableRow["createdById"];
	public deletedById: Models.VideoTableRow["deletedById"];
	public updatedById: Models.VideoTableRow["updatedById"];
}
