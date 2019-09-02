import * as Models from "../models";

import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType()
export class CourseEdition
	implements
		Pick<Models.CourseEdition, "id" | "name" | "semester" | "year" | "createdAt" | "updatedAt" | "deletedAt"> {
	@Field(() => Int)
	public id: Models.CourseEdition["id"];

	@Field(() => String)
	public name: Models.CourseEdition["name"];

	@Field(() => Int)
	public semester: Models.CourseEdition["semester"];

	@Field(() => Int)
	public year: Models.CourseEdition["year"];

	@Field(() => String)
	public visibility: Models.CourseEdition["visibility"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public createdAt: Models.CourseEdition["createdAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Models.CourseEdition["updatedAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt?: Models.CourseEdition["deletedAt"];
}
