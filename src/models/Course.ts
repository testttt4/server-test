import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, PrimaryKey, Table } from "sequelize-typescript";

import { BaseModel } from "./BaseModel";
import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";
import { pick } from "../utils/Helper";

export const CourseVisibility: { [K in "public" | "hidden" | "disabled"]: K } = {
	public: "public",
	disabled: "disabled",
	hidden: "hidden",
};

export const CourseAttributes: {
	[K in keyof Required<
		Pick<
			Course,
			| "id"
			| "name"
			| "visibility"
			| "code"
			| "iconURL"
			| "eva"
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
	name: "name",
	visibility: "visibility",
	code: "code",
	iconURL: "iconURL",
	eva: "eva",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export type CourseTableRow = Pick<Course, keyof typeof CourseAttributes>;

export const CourseRelations: {
	[K in keyof Required<Pick<Course, "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "Course" })
export class Course extends BaseModel<Course> {
	public static fromTableRow(data: CourseTableRow): Course {
		return new Course(data);
	}

	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@Column({ type: DataType.STRING })
	public name: string;

	@Column({ type: DataType.STRING })
	public visibility: keyof typeof CourseVisibility;

	@Column({ type: DataType.STRING })
	public code: string;

	@Column({ type: DataType.STRING })
	public iconURL: Nullable<string>;

	@Column({ type: DataType.STRING })
	public eva: Nullable<string>;

	@Column(DataType.DATE)
	public createdAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, CourseAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, CourseAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, CourseAttributes.deletedById)
	public deletedBy: Nullable<User>;

	public toTableRow = () => pick(this, Object.keys(CourseAttributes) as Array<keyof typeof CourseAttributes>);
}
