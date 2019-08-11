import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Video {
	@Field(() => Int)
	public id: number;

	@Field(() => String, { nullable: true })
	public name: string;

	@Field(() => Int, { nullable: true })
	public position: number;

	@Field(() => GraphQLISODateTime)
	public createdAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt?: Date;
}
