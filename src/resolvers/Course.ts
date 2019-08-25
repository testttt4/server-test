import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";
import * as Mutations from "../mutations";
import * as Schemas from "../schemas";

import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	Info,
	InputType,
	Int,
	Mutation,
	Query,
	Resolver,
	Root,
	registerEnumType,
} from "type-graphql";
import { GraphQLBoolean, GraphQLResolveInfo } from "graphql";
import { Authenticated } from "../middlewares";
import { Context } from "../Context";
import { FileUpload } from "graphql-upload";
import { GraphQLUpload } from "apollo-server-core";
import { Nullable } from "../typings/helperTypes";
import { UserRoleName } from "./User";

export enum CourseStatus {
	Admin = "admin",
	User = "user",
}
registerEnumType(UserRoleName, {
	name: "UserRoleName",
});

@InputType()
export class CreateCourseInput {
	@Field(() => String)
	public code: string;

	@Field(() => String)
	public name: string;

	@Field(() => CourseStatus, { nullable: true })
	public state: Nullable<CourseStatus>;

	@Field(() => String, { nullable: true })
	public eva?: Nullable<string>;

	@Field(() => Int)
	public semester: number;

	@Field(() => Int)
	public year: number;

	@Field(() => GraphQLUpload!, { nullable: true })
	public icon?: Nullable<FileUpload>;
}

@InputType()
export class UpdateCourseInput {
	@Field(() => String, { nullable: true })
	public code?: Nullable<string>;

	@Field(() => String, { nullable: true })
	public name?: Nullable<string>;

	@Field(() => CourseStatus, { nullable: true })
	public state: Nullable<CourseStatus>;

	@Field(() => String, { nullable: true })
	public eva?: Nullable<string>;

	@Field(() => Int, { nullable: true })
	public semester?: Nullable<number>;

	@Field(() => Int, { nullable: true })
	public year?: Nullable<number>;

	@Field(() => GraphQLUpload!, { nullable: true })
	public icon: Nullable<FileUpload>;
}

@Resolver(() => Schemas.Course)
export class Course {
	//#region Mutations
	@Mutation(() => Schemas.Course)
	@Authenticated([UserRoleName.Admin])
	public async createCourse(
		@Arg("course") courseInput: CreateCourseInput,
		@Ctx() context: Context
	): Promise<Models.Course> {
		const result = await Mutations.Course.create({
			data: courseInput,
			userId: context.me!.id,
		});

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => Schemas.Course)
	@Authenticated([UserRoleName.Admin])
	public async updateCourse(
		@Arg("id", () => Int) id: number,
		@Arg("values") updateCourseInput: UpdateCourseInput,
		@Ctx() context: Context
	): Promise<Models.Course> {
		const result = await Mutations.Course.update({ id, userId: context.me!.id, data: updateCourseInput });

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => GraphQLBoolean)
	@Authenticated([Models.UserRoleName.Admin])
	public async deleteCourse(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
		return Mutations.Course.deleteCourse({ id, userId: context.me!.id });
	}
	//#endregion

	//#region Queries
	@Query(() => [Schemas.Course])
	public async courses(@Info() info: GraphQLResolveInfo): Promise<Models.Course[]> {
		return Data.Course.findAll({});
	}

	@Query(() => Schemas.Course)
	public async courseById(
		@Arg("id", () => Int) id: number,
		@Info() info: GraphQLResolveInfo
	): Promise<Models.Course> {
		return Data.Course.findOneOrThrow({
			id,
		});
	}

	@Query(() => Schemas.Course, { nullable: true })
	public async courseByCode(
		@Arg("code", () => String) code: string,
		@Info() info: GraphQLResolveInfo
	): Promise<Models.Course> {
		return Data.Course.findOneOrThrow({
			code: code.trim(),
		});
	}
	//#endregion

	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClassList])
	public async classLists(
		@Root() course: { id?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.CourseClassList[]> {
		if (!course.id) return [];

		return Data.CourseClassList.findAll({
			courseId: course.id,
		});
	}

	@FieldResolver({ nullable: true })
	public async createdBy(
		@Root() course: { createdBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (!course.createdBy) return null;

		return (await Data.User.findOne({ id: course.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true, complexity: options => options.childComplexity + 1 })
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
