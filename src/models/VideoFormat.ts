import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./User";
import { VideoQuality } from "./VideoQuality";

@Table({ modelName: "VideoFormat" })
export class VideoFormat extends Model<VideoFormat> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => VideoQuality)
	@Column({ type: DataType.INTEGER })
	public videoQualityId?: Nullable<number>;

	@Column({ type: DataType.STRING })
	public name?: Nullable<string>;

	@Column({ type: DataType.STRING })
	public url?: Nullable<string>;

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
