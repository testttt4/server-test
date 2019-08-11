import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";

@ObjectType("Course")
export class Course {
	@Field(() => Int)
	public id: number;

	@Field()
	public code: string;

	@Field()
	public name: string;

	@Field({ nullable: true })
	public iconURL: string;

	@Field({ nullable: true })
	public eva: string;

	@Field({ nullable: true })
	public semester: number;

	@Field({ nullable: true })
	public year: number;

	@Field(() => Date)
	public createdAt: Date;

	@Field(() => User, { nullable: true })
	public createdBy: User;

	@Field(() => Date, { nullable: true })
	public updatedAt: Date;

	@Field(() => User, { nullable: true })
	public updatedBy: User;

	@Field(() => Date, { nullable: true })
	public deletedAt: Date;

	@Field(() => User, { nullable: true })
	public deletedBy: User;
}
