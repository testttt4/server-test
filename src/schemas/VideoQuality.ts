import { GraphQLBoolean } from "graphql";
import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

@ObjectType("VideoQuality")
export class VideoQuality {
	@Field(() => Int)
	public id: number;

	@Field(() => Int, { nullable: true })
	public height: number;

	@Field(() => Int, { nullable: true })
	public width: number;

	@Field(() => GraphQLBoolean, { nullable: true })
	public disabled: boolean;

	@Field(() => GraphQLISODateTime)
	public createdAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt: Date;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt?: Date;
}
