import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";
import * as Mutations from "../mutations";
import * as Schemas from "../schemas";

import { Arg, Ctx, Field, FieldResolver, Info, InputType, Int, Mutation, Resolver, Root } from "type-graphql";
import { GraphQLBoolean, GraphQLResolveInfo } from "graphql";

import { Authenticated } from "../middlewares";
import { Context } from "../Context";
import { Nullable } from "../typings/helperTypes";
import { UserRoleName } from "./User";

@InputType()
export class CreateCourseClassListInput {
	@Field(() => String)
	public name: string;

	@Field(() => Int)
	public courseId: number;

	@Field(() => Boolean, { nullable: true })
	public disabled?: Nullable<boolean>;
}

@InputType()
export class UpdateCourseClassListInput {
	@Field(() => String)
	public name: string;

	@Field(() => Boolean, { nullable: true })
	public disabled?: Nullable<boolean>;
}

@Resolver(() => Schemas.CourseClassList)
export class CourseClassList {
	//#region Mutations
	@Mutation(() => Schemas.CourseClassList)
	@Authenticated([UserRoleName.Admin])
	public async createCourseClassList(
		@Arg("data", () => CreateCourseClassListInput) data: CreateCourseClassListInput,
		@Ctx() context: Context
	): Promise<Models.CourseClassList> {
		const result = await Mutations.CourseClassList.create({
			data,
			userId: context.me!.id,
		});

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => Schemas.CourseClassList)
	@Authenticated([UserRoleName.Admin])
	public async updateCourseClassList(
		@Arg("id", () => Int) id: number,
		@Arg("data", () => UpdateCourseClassListInput) data: UpdateCourseClassListInput,
		@Ctx() context: Context
	): Promise<Models.CourseClassList> {
		const result = await Mutations.CourseClassList.update({
			id,
			data,
			userId: context.me!.id,
		});

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => GraphQLBoolean)
	@Authenticated([Models.UserRoleName.Admin])
	public async deleteCourseClassList(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
		await Mutations.CourseClassList.deleteCourseClassList({ id, userId: context.me!.id });

		return true;
	}
	//#endregion

	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClass], { nullable: true })
	public async classes(
		@Root() courseClassList: { id?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.CourseClass[]> {
		if (typeof courseClassList.id !== "number") return [];

		return Data.CourseClass.findAll({ courseClassListId: courseClassList.id });
	}

	@FieldResolver(() => Schemas.Course, { nullable: true })
	public async course(
		@Root() root: Models.CourseClassList,
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.Course | null> {
		if (!root.courseId) return null;

		return (
			(await Data.Course.findOne({
				id: root.courseId,
			})) || null
		);
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(
		@Root() course: { createdBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (!course.createdBy) return null;

		return (await Data.User.findOne({ id: course.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(
		@Root() course: { updatedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (!course.updatedBy) return null;

		return (await Data.User.findOne({ id: course.updatedBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(
		@Root() course: { deletedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (!course.deletedBy) return null;

		return (await Data.User.findOne({ id: course.deletedBy })) || null;
	}
	//#endregion
}
