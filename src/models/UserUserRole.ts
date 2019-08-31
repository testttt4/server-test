import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";
import { UserRole } from "./internal";

export const UserUserRoleAttributes: {
	[K in keyof Required<
		Pick<UserUserRole, "id" | "userId" | "userRoleId" | "createdAt" | "updatedAt" | "deletedAt">
	>]: K;
} = {
	id: "id",
	userId: "userId",
	userRoleId: "userRoleId",
	createdAt: "createdAt",
	updatedAt: "updatedAt",
	deletedAt: "deletedAt",
};

@Table({ modelName: "UserUserRole" })
export class UserUserRole extends Model<UserUserRole> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	public userId?: Nullable<number>;

	@ForeignKey(() => UserRole)
	@Column(DataType.SMALLINT)
	public userRoleId?: Nullable<number>;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;
}
