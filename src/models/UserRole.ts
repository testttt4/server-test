import { AutoIncrement, Column, DataType, Default, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";

export enum UserRoleName {
	Admin = "admin",
	User = "user",
}

@Table({ modelName: "UserRole" })
export class UserRole extends Model<UserRole> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@Default("user")
	@Column({ type: DataType.STRING })
	public name: UserRoleName;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;
}
