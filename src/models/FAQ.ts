import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./User";

@Table({ modelName: "FAQ" })
export class FAQ extends Model<FAQ> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@Column(DataType.STRING)
	public title?: Nullable<string>;

	@Column(DataType.TEXT)
	public content?: Nullable<string>;

	@Column(DataType.BOOLEAN)
	public isHTML?: Nullable<boolean>;

	@Column({ type: DataType.SMALLINT })
	public position?: Nullable<number>;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdBy?: Nullable<number>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedBy?: Nullable<number>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedBy?: Nullable<number>;
}
