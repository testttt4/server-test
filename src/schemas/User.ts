import * as Models from "../models";

import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("User")
export class User implements Models.UserTableRow {
	@Field(() => Int)
	public id: Models.UserTableRow["id"];

	@Field(() => String)
	public email: Models.UserTableRow["email"];

	@Field(() => String)
	public name: Models.UserTableRow["name"];

	@Field(() => String)
	public uid: Models.UserTableRow["uid"];

	@Field(() => Date, { nullable: true })
	public createdAt: Models.UserTableRow["createdAt"];

	@Field(() => Date, { nullable: true })
	public updatedAt: Models.UserTableRow["updatedAt"];

	@Field(() => Date, { nullable: true })
	public deletedAt: Models.UserTableRow["deletedAt"];
}
