import {
	AutoIncrement,
	BelongsToMany,
	Column,
	DataType,
	Default,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";
import { User, UserUserRole } from "./internal";

import { Nullable } from "../typings/helperTypes";
import { pick } from "../utils/Helper";

export const UserRoleName: { [K in "admin" | "user"]: K } = {
	admin: "admin",
	user: "user",
};

export const UserRoleAttributes: {
	[K in keyof Required<Pick<UserRole, "id" | "name" | "createdAt" | "updatedAt" | "deletedAt">>]: K;
} = {
	id: "id",
	name: "name",
	createdAt: "createdAt",
	updatedAt: "updatedAt",
	deletedAt: "deletedAt",
};

export type UserRoleTableRow = Pick<UserRole, keyof typeof UserRoleAttributes>;

export const UserRoleRelations: {
	[K in keyof Required<Pick<UserRole, "users">>]: K;
} = {
	users: "users",
};

@Table({ modelName: "UserRole" })
export class UserRole extends Model<UserRole> {
	public static fromTableRow(data: UserRole): UserRole {
		return new UserRole(data);
	}

	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@Default("user")
	@Column({ type: DataType.STRING })
	public name: keyof typeof UserRoleName;

	@BelongsToMany(() => User, () => UserUserRole)
	public users: User[];

	@Column(DataType.DATE)
	public createdAt: Nullable<Date>;

	@Column(DataType.DATE)
	public updatedAt: Nullable<Date>;

	@Column(DataType.DATE)
	public deletedAt: Nullable<Date>;

	public toTableRow = () => pick(this, Object.keys(UserRoleAttributes) as Array<keyof typeof UserRoleAttributes>);
}
