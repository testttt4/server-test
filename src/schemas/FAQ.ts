import { Field, Int, ObjectType } from "type-graphql";

@ObjectType("FAQ")
export class FAQ {
	@Field(() => Int)
	public id: number;

	@Field()
	public title: string;

	@Field()
	public content: string;

	@Field()
	public isHTML: boolean;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => Date, { nullable: true })
	public updatedAt: Date;

	@Field(() => Date, { nullable: true })
	public deletedAt: Date;
}
