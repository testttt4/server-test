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

import { CourseClass } from "./internal";
import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";
import { VideoQuality } from "./internal";

export const VideoAttributes: {
	[K in keyof Required<
		Pick<
			Video,
			| "id"
			| "courseClassId"
			| "name"
			| "position"
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
	courseClassId: "courseClassId",
	name: "name",
	position: "position",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export const VideoRelations: {
	[K in keyof Required<Pick<Video, "courseClass" | "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	courseClass: "courseClass",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "Video" })
export class Video extends Model<Video> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => CourseClass)
	@Column({ type: DataType.INTEGER })
	public courseClassId: number;

	@BelongsTo(() => CourseClass, VideoAttributes.courseClassId)
	public courseClass: CourseClass;

	@Column({ type: DataType.STRING })
	public name: string;

	@Column({ type: DataType.SMALLINT })
	public position: number;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@HasMany(() => VideoQuality, "videoId")
	public videoQualities: VideoQuality[];

	@BelongsTo(() => User, VideoAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, VideoAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, VideoAttributes.deletedById)
	public deletedBy: Nullable<User>;
}
