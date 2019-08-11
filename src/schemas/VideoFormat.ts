import { Field, GraphQLISODateTime, Int, ObjectType } from "type-graphql";

import { Nullable } from "../typings/helperTypes";

@ObjectType("VideoFormat")
export class VideoFormat {
	@Field(() => Int)
	public id: number;

	@Field(() => String, { nullable: true })
	public name?: Nullable<string>;

	@Field(() => String, { nullable: true })
	public url?: Nullable<string>;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public createdAt?: Nullable<Date>;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public updatedAt?: Nullable<Date>;

	@Field(() => GraphQLISODateTime, { nullable: true })
	public deletedAt?: Nullable<Date>;
}
