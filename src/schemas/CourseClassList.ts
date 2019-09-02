import * as Models from "../models";

import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType()
export class CourseClassList implements Models.CourseClassListTableRow {
	@Field(() => Int)
	public id: Models.CourseClassListTableRow["id"];

	@Field(() => String, { nullable: true })
	public name: Models.CourseClassListTableRow["name"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public createdAt: Models.CourseClassListTableRow["createdAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Models.CourseClassListTableRow["updatedAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt: Models.CourseClassListTableRow["deletedAt"];

	public courseEditionId: Models.CourseClassListTableRow["courseEditionId"];
	public visibility: Models.CourseClassListTableRow["visibility"];
	public createdById: Models.CourseClassListTableRow["createdById"];
	public updatedById: Models.CourseClassListTableRow["updatedById"];
	public deletedById: Models.CourseClassListTableRow["deletedById"];
}
