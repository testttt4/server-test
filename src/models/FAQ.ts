import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";
import { pick } from "../utils/Helper";

export const FAQAttributes: {
	[K in keyof Required<
		Pick<
			FAQ,
			| "id"
			| "title"
			| "content"
			| "isHTML"
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
	title: "title",
	content: "content",
	isHTML: "isHTML",
	createdAt: "createdAt",
	createdById: "createdById",
	updatedAt: "updatedAt",
	updatedById: "updatedById",
	deletedAt: "deletedAt",
	deletedById: "deletedById",
};

export type FAQTableRow = Pick<FAQ, keyof typeof FAQAttributes>;

export const FAQRelations: {
	[K in keyof Required<Pick<FAQ, "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "FAQ" })
export class FAQ extends Model<FAQ> {
	public static fromTableRow(data: FAQTableRow): FAQ {
		return new FAQ(data);
	}

	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@Column({ type: DataType.STRING, allowNull: false })
	public title: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	public content: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	public isHTML: boolean;

	@Column(DataType.DATE)
	public createdAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.deletedById)
	public deletedBy: Nullable<User>;

	public toTableRow = () => pick(this, Object.keys(FAQAttributes) as Array<keyof typeof FAQAttributes>);
}
