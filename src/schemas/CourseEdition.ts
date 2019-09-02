import * as Models from "../models";

import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType()
export class CourseEdition implements Models.CourseEditionTableRow {
	@Field(() => Int)
	public id: Models.CourseEditionTableRow["id"];

	@Field(() => String)
	public name: Models.CourseEditionTableRow["name"];

	@Field(() => Int)
	public semester: Models.CourseEditionTableRow["semester"];

	@Field(() => Int)
	public year: Models.CourseEditionTableRow["year"];

	@Field(() => String)
	public visibility: Models.CourseEditionTableRow["visibility"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public createdAt: Models.CourseEditionTableRow["createdAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Models.CourseEditionTableRow["updatedAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt: Models.CourseEditionTableRow["deletedAt"];

	public courseId: Models.CourseEditionTableRow["courseId"];
	public createdById: Models.CourseEditionTableRow["createdById"];
	public updatedById: Models.CourseEditionTableRow["updatedById"];
	public deletedById: Models.CourseEditionTableRow["deletedById"];
}
