import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { CourseClassList } from "./CourseClassList";
import { Nullable } from "../typings/helperTypes";
import { User } from "./User";

@Table({ modelName: "CourseClass" })
export class CourseClass extends Model<CourseClass> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@ForeignKey(() => CourseClassList)
	@Column({ type: DataType.SMALLINT })
	public courseClassListId: number;

	@Column({ type: DataType.SMALLINT })
	public number: number;

	@Column({ allowNull: false })
	public title: string;

	@Column(DataType.BOOLEAN)
	public disabled: boolean | null;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdBy: number | null;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedBy: number | null;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedBy: number | null;
}
