import { Field, FieldResolver, InputType, Int, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";
import { Nullable } from "../typings/helperTypes";

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
	// @Mutation(() => Schemas.CourseClassList)
	// @Authenticated([UserRoleName.Admin])
	// public async createCourseClassList(
	// 	@Arg("data", () => CreateCourseClassListInput) data: CreateCourseClassListInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.CourseClassList> {
	// 	const result = await Mutations.CourseClassList.create({
	// 		data,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => Schemas.CourseClassList)
	// @Authenticated([UserRoleName.Admin])
	// public async updateCourseClassList(
	// 	@Arg("id", () => Int) id: number,
	// 	@Arg("data", () => UpdateCourseClassListInput) data: UpdateCourseClassListInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.CourseClassList> {
	// 	const result = await Mutations.CourseClassList.update({
	// 		id,
	// 		data,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => GraphQLBoolean)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async deleteCourseClassList(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
	// 	await Mutations.CourseClassList.deleteCourseClassList({ id, userId: context.me!.id });

	// 	return true;
	// }
	//#endregion

	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClass], { nullable: true })
	public async classes(@Root() courseClassList: Models.CourseClassList): Promise<Models.CourseClass[]> {
		if (typeof courseClassList.id !== "number") return [];

		return Data.CourseClass.findAll({ courseClassListId: courseClassList.id });
	}

	@FieldResolver(() => Schemas.CourseEdition, { nullable: true })
	public async courseEdition(@Root() root: Models.CourseClassList): Promise<Models.CourseEdition | null> {
		if (!root.courseEditionId) return null;

		return Data.CourseEdition.findOne({
			id: root.courseEditionId,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseclasslist: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseclasslist.createdById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseclasslist: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseclasslist.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseclasslist: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseclasslist.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.deletedById });
	}
	//#endregion
}
