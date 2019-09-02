import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { Arg, Field, FieldResolver, InputType, Int, Query, Resolver, Root, registerEnumType } from "type-graphql";
import { FileUpload } from "graphql-upload";
import { GraphQLUpload } from "apollo-server-core";
import { Nullable } from "../typings/helperTypes";

export enum CourseStatus {
	Admin = "admin",
	User = "user",
}
registerEnumType(CourseStatus, {
	name: "CourseStatus",
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
	// #region Mutations
	// @Mutation(() => Schemas.Course)
	// @Authenticated([UserRoleName.Admin])
	// public async createCourse(
	// 	@Arg("course") courseInput: CreateCourseInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.Course> {
	// 	const result = await Mutations.Course.create({
	// 		data: courseInput,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => Schemas.Course)
	// @Authenticated([UserRoleName.Admin])
	// public async updateCourse(
	// 	@Arg("id", () => Int) id: number,
	// 	@Arg("values") updateCourseInput: UpdateCourseInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.Course> {
	// 	const result = await Mutations.Course.update({ id, userId: context.me!.id, data: updateCourseInput });

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => GraphQLBoolean)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async deleteCourse(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
	// 	return Mutations.Course.deleteCourse({ id, userId: context.me!.id });
	// }
	//#endregion

	//#region Queries
	@Query(() => [Schemas.Course])
	public async courses(): Promise<Models.Course[]> {
		return Data.Course.findAll({});
	}

	@Query(() => Schemas.Course)
	public async courseById(@Arg("id", () => Int) id: number): Promise<Models.Course> {
		return Data.Course.findOneOrThrow({
			id,
		});
	}

	@Query(() => Schemas.Course, { nullable: true })
	public async courseByCode(@Arg("code", () => String) code: string): Promise<Models.Course> {
		return Data.Course.findOneOrThrow({
			code: code.trim(),
		});
	}
	//#endregion

	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseEdition])
	public async editions(@Root() course: Models.Course): Promise<Models.CourseEdition[]> {
		if (!course.id) return [];

		return Data.CourseEdition.findAll({
			courseId: course.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() course: Models.Course): Promise<Models.User | null> {
		if (typeof course.createdById !== "number") return null;

		return Data.User.findOne({ id: course.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() course: Models.Course): Promise<Models.User | null> {
		if (typeof course.updatedById !== "number") return null;

		return Data.User.findOne({ id: course.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() course: Models.Course): Promise<Models.User | null> {
		if (typeof course.deletedById !== "number") return null;

		return Data.User.findOne({ id: course.deletedById });
	}
	//#endregion
}
