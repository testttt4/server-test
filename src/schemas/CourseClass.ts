import { GraphQLBoolean } from "graphql";
import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType("CourseClass")
export class CourseClass {
	@Field(() => Int)
	public id: number;

	@Field(() => Int, { nullable: true })
	public number: number;

	@Field(() => String, { nullable: true })
	public title: string;

	@Field(() => GraphQLBoolean, { nullable: true })
	public disabled: boolean;

	@Field(() => GraphQLISODateTime)
	public createdAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt?: Date;
}
