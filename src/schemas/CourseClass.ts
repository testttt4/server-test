import * as Models from "../models";

import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

import { GraphQLBoolean } from "graphql";

@ObjectType("CourseClass")
export class CourseClass implements Models.CourseClassTableRow {
	@Field(() => Int)
	public id: Models.CourseClassTableRow["id"];

	@Field(() => Int, { nullable: true })
	public number: Models.CourseClassTableRow["number"];

	@Field(() => String, { nullable: true })
	public title: Models.CourseClassTableRow["title"];

	@Field(() => GraphQLBoolean, { nullable: true })
	public disabled: Models.CourseClassTableRow["disabled"];

	@Field(() => GraphQLISODateTime)
	public createdAt: Models.CourseClassTableRow["createdAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Models.CourseClassTableRow["updatedAt"];

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt: Models.CourseClassTableRow["deletedAt"];

	public courseClassListId: Models.CourseClassTableRow["courseClassListId"];
	public createdById: Models.CourseClassTableRow["createdById"];
	public updatedById: Models.CourseClassTableRow["updatedById"];
	public deletedById: Models.CourseClassTableRow["deletedById"];
}
