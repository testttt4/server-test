import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";
import { VideoQuality } from "./internal";
import { pick } from "../utils/Helper";

export const VideoFormatAttributes: {
	[K in keyof Required<
		Pick<
			VideoFormat,
			| "id"
			| "videoQualityId"
			| "name"
			| "url"
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
	videoQualityId: "videoQualityId",
	name: "name",
	url: "url",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export type VideoFormatTableRow = Pick<VideoFormat, keyof typeof VideoFormatAttributes>;

export const VideoFormatRelations: {
	[K in keyof Required<Pick<VideoFormat, "videoQuality" | "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	videoQuality: "videoQuality",
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "VideoFormat" })
export class VideoFormat extends Model<VideoFormat> {
	public static fromTableRow(data: VideoFormatTableRow): VideoFormat {
		return new VideoFormat(data);
	}

	public constructor(values: Required<Pick<VideoFormat, keyof Omit<typeof VideoFormatAttributes, "id">>>) {
		super(values);
	}

	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => VideoQuality)
	@Column({ type: DataType.INTEGER })
	public videoQualityId: number;

	@BelongsTo(() => VideoQuality, VideoFormatAttributes.videoQualityId)
	public videoQuality: Nullable<VideoQuality>;

	@Column({ type: DataType.STRING, allowNull: false })
	public name: string;

	@Column({ type: DataType.STRING, allowNull: false })
	public url: string;

	@Column(DataType.DATE)
	public createdAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, VideoFormatAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, VideoFormatAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, VideoFormatAttributes.deletedById)
	public deletedBy: Nullable<User>;

	public toTableRow = () =>
		pick(this, Object.keys(VideoFormatAttributes) as Array<keyof typeof VideoFormatAttributes>);
}
