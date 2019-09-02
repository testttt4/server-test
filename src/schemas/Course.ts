import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("Course")
export class Course implements Models.CourseTableRow {
	@Field(() => Int)
	public id: Models.CourseTableRow["id"];

	@Field(() => String)
	public code: Models.CourseTableRow["code"];

	@Field(() => String)
	public name: Models.CourseTableRow["name"];

	@Field(() => String, { nullable: true })
	public iconURL: Models.CourseTableRow["iconURL"];

	@Field(() => String, { nullable: true })
	public eva: Models.CourseTableRow["eva"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.CourseTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.CourseTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.CourseTableRow["deletedAt"];

	public visibility: Models.CourseTableRow["visibility"];
	public createdById: Models.CourseTableRow["createdById"];
	public updatedById: Models.CourseTableRow["updatedById"];
	public deletedById: Models.CourseTableRow["deletedById"];
}
