import {
	AutoIncrement,
	BelongsToMany,
	Column,
	DataType,
	HasMany,
	Model,
	PrimaryKey,
	Table,
} from "sequelize-typescript";
import {
	Course,
	CourseClass,
	CourseClassList,
	CourseEdition,
	FAQ,
	UserRole,
	UserUserRole,
	Video,
	VideoFormat,
	VideoQuality,
} from "./internal";

import { Nullable } from "../typings/helperTypes";

export const UserAttributes: {
	[K in keyof Required<Pick<User, "id" | "email" | "uid" | "name" | "createdAt" | "updatedAt" | "deletedAt">>]: K;
} = {
	id: "id",
	email: "email",
	uid: "uid",
	name: "name",
	createdAt: "createdAt",
	updatedAt: "updatedAt",
	deletedAt: "deletedAt",
};

export const UserRelations: {
	[K in keyof Required<
		Pick<
			User,
			| "userRoles"
			| "createdCourses"
			| "updatedCourses"
			| "deletedCourses"
			| "createdCourseClassLists"
			| "updatedCourseClassLists"
			| "deletedCourseClassLists"
			| "createdCourseEditions"
			| "updatedCourseEditions"
			| "deletedCourseEditions"
			| "createdFAQs"
			| "updatedFAQs"
			| "deletedFAQs"
			| "createdVideos"
			| "updatedVideos"
			| "deletedVideos"
			| "createdVideoFormats"
			| "updatedVideoFormats"
			| "deletedVideoFormats"
			| "createdVideoQualities"
			| "updatedVideoQualities"
			| "deletedVideoQualities"
		>
	>]: K;
} = {
	userRoles: "userRoles",
	createdCourses: "createdCourses",
	updatedCourses: "updatedCourses",
	deletedCourses: "deletedCourses",
	createdCourseClassLists: "createdCourseClassLists",
	updatedCourseClassLists: "updatedCourseClassLists",
	deletedCourseClassLists: "deletedCourseClassLists",
	createdCourseEditions: "createdCourseEditions",
	updatedCourseEditions: "updatedCourseEditions",
	deletedCourseEditions: "deletedCourseEditions",
	createdFAQs: "createdFAQs",
	updatedFAQs: "updatedFAQs",
	deletedFAQs: "deletedFAQs",
	createdVideos: "createdVideos",
	updatedVideos: "updatedVideos",
	deletedVideos: "deletedVideos",
	createdVideoFormats: "createdVideoFormats",
	updatedVideoFormats: "updatedVideoFormats",
	deletedVideoFormats: "deletedVideoFormats",
	createdVideoQualities: "createdVideoQualities",
	updatedVideoQualities: "updatedVideoQualities",
	deletedVideoQualities: "deletedVideoQualities",
};

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

	@BelongsToMany(() => UserRole, () => UserUserRole)
	public userRoles: UserRole[];

	@HasMany(() => Course, "createdById")
	public createdCourses: Course[];

	@HasMany(() => Course, "updatedById")
	public updatedCourses: Course[];

	@HasMany(() => Course, "deletedById")
	public deletedCourses: Course[];

	@HasMany(() => CourseClass, "createdById")
	public createdCourseClasses: CourseClass[];

	@HasMany(() => CourseClass, "updatedById")
	public updatedCourseClasses: CourseClass[];

	@HasMany(() => CourseClass, "deletedById")
	public deletedCourseClasses: CourseClass[];

	@HasMany(() => CourseClassList, "createdById")
	public createdCourseClassLists: CourseClassList[];

	@HasMany(() => CourseClassList, "updatedById")
	public updatedCourseClassLists: CourseClassList[];

	@HasMany(() => CourseClassList, "deletedById")
	public deletedCourseClassLists: CourseClassList[];

	@HasMany(() => CourseEdition, "createdById")
	public createdCourseEditions: CourseEdition[];

	@HasMany(() => CourseEdition, "updatedById")
	public updatedCourseEditions: CourseEdition[];

	@HasMany(() => CourseEdition, "deletedById")
	public deletedCourseEditions: CourseEdition[];

	@HasMany(() => FAQ, "createdById")
	public createdFAQs: FAQ[];

	@HasMany(() => FAQ, "updatedById")
	public updatedFAQs: FAQ[];

	@HasMany(() => FAQ, "deletedById")
	public deletedFAQs: FAQ[];

	@HasMany(() => Video, "createdById")
	public createdVideos: Video[];

	@HasMany(() => Video, "updatedById")
	public updatedVideos: Video[];

	@HasMany(() => Video, "deletedById")
	public deletedVideos: Video[];

	@HasMany(() => VideoFormat, "createdById")
	public createdVideoFormats: VideoFormat[];

	@HasMany(() => VideoFormat, "updatedById")
	public updatedVideoFormats: VideoFormat[];

	@HasMany(() => VideoFormat, "deletedById")
	public deletedVideoFormats: VideoFormat[];

	@HasMany(() => VideoQuality, "createdById")
	public createdVideoQualities: VideoQuality[];

	@HasMany(() => VideoQuality, "updatedById")
	public updatedVideoQualities: VideoQuality[];

	@HasMany(() => VideoQuality, "deletedById")
	public deletedVideoQualities: VideoQuality[];

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;
}
