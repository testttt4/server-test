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
import { User, Video, VideoFormat } from "./internal";

import { Nullable } from "../typings/helperTypes";

export const VideoQualityAttributes: {
	[K in keyof Required<
		Pick<
			VideoQuality,
			| "id"
			| "videoId"
			| "width"
			| "height"
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
	videoId: "videoId",
	width: "width",
	height: "height",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export const VideoQualityRelations: {
	[K in keyof Required<Pick<VideoQuality, "video" | "videoFormats" | "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	video: "video",
	videoFormats: "videoFormats",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "VideoQuality" })
export class VideoQuality extends Model<VideoQuality> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => Video)
	@Column({ type: DataType.INTEGER })
	public videoId: number;

	@BelongsTo(() => Video, VideoQualityAttributes.videoId)
	public video: Video;

	@Column({ type: DataType.INTEGER })
	public width: number;

	@Column({ type: DataType.INTEGER })
	public height: number;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@HasMany(() => VideoFormat, "videoQualityId")
	public videoFormats: VideoFormat[];

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, VideoQualityAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, VideoQualityAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, VideoQualityAttributes.deletedById)
	public deletedBy: Nullable<User>;
}
