import {
	AutoIncrement,
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";
import { CourseClassList, User, Video } from "./internal";

import { Nullable } from "../typings/helperTypes";
import { pick } from "../utils/Helper";

export const CourseClassAttributes: {
	[K in keyof Required<
		Pick<
			CourseClass,
			| "id"
			| "courseClassListId"
			| "number"
			| "title"
			| "disabled"
			| "createdAt"
			| "createdById"
			| "updatedAt"
			| "updatedById"
			| "deletedAt"
			| "deletedById"
		>
	>]: K;
} = {
	id: "id",
	courseClassListId: "courseClassListId",
	number: "number",
	title: "title",
	disabled: "disabled",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export type CourseClassTableRow = Pick<CourseClass, keyof typeof CourseClassAttributes>;

export const CourseClassRelations: {
	[K in keyof Required<Pick<CourseClass, "courseClassList" | "videos" | "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	courseClassList: "courseClassList",
	videos: "videos",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "CourseClass" })
export class CourseClass extends Model<CourseClass> {
	public static fromTableRow(data: CourseClassTableRow): CourseClass {
		return new CourseClass(data);
	}

	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@ForeignKey(() => CourseClassList)
	@Column
	public courseClassListId: number;

	@BelongsTo(() => CourseClassList, CourseClassAttributes.courseClassListId)
	public courseClassList: any;

	@Column({ type: DataType.SMALLINT })
	public number: number;

	@Column({ allowNull: false })
	public title: string;

	@Column(DataType.BOOLEAN)
	public disabled: boolean | null;

	@HasMany(() => Video, "courseClassId")
	public videos: Video[];

	@Column(DataType.DATE)
	public createdAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, CourseClassAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, CourseClassAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, CourseClassAttributes.deletedById)
	public deletedBy: Nullable<User>;

	public toTableRow = () =>
		pick(this, Object.keys(CourseClassAttributes) as Array<keyof typeof CourseClassAttributes>);
}
