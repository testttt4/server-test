import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class UserRole implements Models.UserRoleTableRow {
	@Field(() => Int)
	public id: Models.UserRoleTableRow["id"];

	@Field(() => String)
	public name: Models.UserRoleTableRow["name"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.UserRoleTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.UserRoleTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.UserRoleTableRow["deletedAt"];
}
