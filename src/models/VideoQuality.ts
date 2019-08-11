import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./User";
import { Video } from "./Video";

@Table({ modelName: "VideoQuality" })
export class VideoQuality extends Model<VideoQuality> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@ForeignKey(() => Video)
	@Column({ type: DataType.INTEGER })
	public videoId: number;

	@Column({ type: DataType.INTEGER })
	public width: number;

	@Column({ type: DataType.INTEGER })
	public height: number;

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
