import { Field, Int, ObjectType } from "type-graphql";

import { Nullable } from "../typings/helperTypes";

@ObjectType()
export class UserRole {
	@Field(() => Int)
	public id: number;

	@Field()
	public name: string;

	@Field(() => Date, { nullable: true })
	public createdAt?: Nullable<Date>;

	@Field(() => Date, { nullable: true })
	public updatedAt?: Nullable<Date>;

	@Field(() => Date, { nullable: true })
	public deletedAt?: Nullable<Date>;
}
