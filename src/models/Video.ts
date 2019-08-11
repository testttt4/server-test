import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { CourseClass } from "./CourseClass";
import { Nullable } from "../typings/helperTypes";
import { User } from "./User";

@Table({ modelName: "Video" })
export class Video extends Model<Video> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => CourseClass)
	@Column({ type: DataType.INTEGER })
	public courseClassId: number;

	@Column({ type: DataType.STRING })
	public name: string;

	@Column({ type: DataType.SMALLINT })
	public position: number;

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
