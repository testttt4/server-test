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
import { CourseClass, CourseEdition, User } from "./internal";

import { Nullable } from "../typings/helperTypes";

export const CourseClassListStatus: { [K in "public" | "hidden" | "disabled"]: K } = {
	public: "public",
	disabled: "disabled",
	hidden: "hidden",
};

export const CourseClassListAttributes: {
	[K in keyof Required<
		Pick<
			CourseClassList,
			| "id"
			| "courseEditionId"
			| "name"
			| "status"
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
	courseEditionId: "courseEditionId",
	name: "name",
	status: "status",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export const CourseClassListRelations: {
	[K in keyof Required<
		Pick<CourseClassList, "courseEdition" | "courseClasses" | "createdBy" | "updatedBy" | "deletedBy">
	>]: K;
} = {
	courseEdition: "courseEdition",
	courseClasses: "courseClasses",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "CourseClassList" })
export class CourseClassList extends Model<CourseClassList> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.SMALLINT)
	public id: number;

	@ForeignKey(() => CourseEdition)
	@Column(DataType.SMALLINT)
	public courseEditionId: number;

	@BelongsTo(() => CourseEdition, CourseClassListAttributes.courseEditionId)
	public courseEdition: CourseEdition;

	@HasMany(() => CourseClass, "courseClassListId")
	public courseClasses: CourseClass[];

	@Column({ type: DataType.STRING })
	public name: string;

	@Column({ type: DataType.STRING })
	public status: keyof typeof CourseClassListStatus;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, CourseClassListAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, CourseClassListAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, CourseClassListAttributes.deletedById)
	public deletedBy: Nullable<User>;
}
