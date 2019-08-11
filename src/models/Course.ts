import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./User";

@Table({ modelName: "Course" })
export class Course extends Model<Course> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@Column({ type: DataType.STRING })
	public name: string;

	@Column(DataType.BOOLEAN)
	public disabled: boolean;

	@Column({ type: DataType.STRING })
	public code: string;

	@Column({ type: DataType.STRING })
	public iconURL?: Nullable<string>;

	@Column({ type: DataType.STRING })
	public eva?: Nullable<string>;

	@Column({ type: DataType.INTEGER })
	public semester: number;

	@Column({ type: DataType.INTEGER })
	public year: number;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	public createdBy?: Nullable<number>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	public updatedBy?: Nullable<number>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedBy?: Nullable<number>;
}
