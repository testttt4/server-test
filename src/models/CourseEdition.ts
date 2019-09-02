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
import { Course, CourseClassList, User } from "./internal";

import { Nullable } from "../typings/helperTypes";

export const CourseEditionVisibility: { [K in "public" | "hidden" | "disabled"]: K } = {
	public: "public",
	disabled: "disabled",
	hidden: "hidden",
};

export const CourseEditionAttributes: {
	[K in keyof Required<
		Pick<
			CourseEdition,
			| "id"
			| "courseId"
			| "name"
			| "semester"
			| "year"
			| "visibility"
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
	courseId: "courseId",
	name: "name",
	semester: "semester",
	year: "year",
	visibility: "visibility",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export const CourseEditionRelations: {
	[K in keyof Required<
		Pick<CourseEdition, "course" | "courseClassLists" | "createdBy" | "updatedBy" | "deletedBy">
	>]: K;
} = {
	course: "course",
	courseClassLists: "courseClassLists",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "CourseEdition" })
export class CourseEdition extends Model<CourseEdition> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@ForeignKey(() => Course)
	@Column(DataType.SMALLINT)
	public courseId: number;

	@BelongsTo(() => Course, CourseEditionAttributes.courseId)
	public course: Course;

	@HasMany(() => CourseClassList, "courseEditionId")
	public courseClassLists: CourseClassList[];

	@Column({ type: DataType.STRING })
	public name: string;

	@Column({ type: DataType.INTEGER })
	public semester: number;

	@Column({ type: DataType.INTEGER })
	public year: number;

	@Column({ type: DataType.STRING })
	public visibility: keyof typeof CourseEditionVisibility;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, CourseEditionAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, CourseEditionAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, CourseEditionAttributes.deletedById)
	public deletedBy: Nullable<User>;
}
