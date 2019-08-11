import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Course } from "./Course";
import { Nullable } from "../typings/helperTypes";
import { User } from "./User";

@Table({ modelName: "CourseClassList" })
export class CourseClassList extends Model<CourseClassList> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@ForeignKey(() => Course)
	@Column(DataType.SMALLINT)
	public courseId: number;

	@Column({ type: DataType.STRING })
	public name: string;

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
