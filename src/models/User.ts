import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";

@Table({ modelName: "User" })
export class User extends Model<User> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@Column({ type: DataType.STRING })
	public email: string;

	@Column({ type: DataType.STRING })
	public uid: string;

	@Column({ type: DataType.STRING })
	public name: string;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;
}
