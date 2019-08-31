import { AutoIncrement, BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Nullable } from "../typings/helperTypes";
import { User } from "./internal";

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

export const FAQRelations: {
	[K in keyof Required<Pick<FAQ, "createdBy" | "updatedBy" | "deletedBy">>]: K;
} = {
	createdBy: "createdBy",
	updatedBy: "updatedBy",
	deletedBy: "deletedBy",
};

@Table({ modelName: "FAQ" })
export class FAQ extends Model<FAQ> {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	public id: number;

	@Column(DataType.STRING)
	public title?: Nullable<string>;

	@Column(DataType.TEXT)
	public content?: Nullable<string>;

	@Column(DataType.BOOLEAN)
	public isHTML?: Nullable<boolean>;

	@Column(DataType.DATE)
	public createdAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public createdById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.createdById)
	public createdBy: Nullable<User>;

	@Column(DataType.DATE)
	public updatedAt?: Nullable<Date>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public updatedById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.updatedById)
	public updatedBy: Nullable<User>;

	@Column(DataType.DATE)
	public deletedAt?: Nullable<Date | string>;

	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	public deletedById: Nullable<number>;

	@BelongsTo(() => User, FAQAttributes.deletedById)
	public deletedBy: Nullable<User>;
}
