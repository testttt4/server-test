import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("FAQ")
export class FAQ implements Models.FAQTableRow {
	@Field(() => Int)
	public id: Models.FAQTableRow["id"];

	@Field(() => String)
	public title: Models.FAQTableRow["title"];

	@Field(() => String)
	public content: Models.FAQTableRow["content"];

	@Field(() => Boolean)
	public isHTML: Models.FAQTableRow["isHTML"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.FAQTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.FAQTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.FAQTableRow["updatedAt"];

	public createdById: Models.FAQTableRow["createdById"];
	public updatedById: Models.FAQTableRow["updatedById"];
	public deletedById: Models.FAQTableRow["deletedById"];
}
