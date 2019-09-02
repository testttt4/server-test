import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { Arg, Field, FieldResolver, InputType, Int, Query, Resolver, Root } from "type-graphql";
import { Authenticate } from "../middlewares/Authenticate";
import { GraphQLBoolean } from "graphql";
import { Nullable } from "../typings/helperTypes";

@InputType()
export class CreateCourseClassVideoInput {
	@Field(() => String)
	public name: string;

	@Field(() => [String])
	public urls: string[];
}

@InputType()
export class CreateCourseClassInput {
	@Field(() => Int)
	public courseClassListId: number;

	@Field(() => Int)
	public number: number;

	@Field(() => String)
	public title: string;

	@Field(() => GraphQLBoolean, { nullable: true })
	public disabled?: Nullable<boolean>;

	@Field(() => [CreateCourseClassVideoInput])
	public videos: CreateCourseClassVideoInput[];
}

@InputType()
export class UpdateCourseClassDeleteVideoInput {
	@Field(() => Int)
	public id: number;
}

@InputType()
export class UpdateCourseClassInput {
	@Field(() => Int, { nullable: true })
	public number?: Nullable<number>;

	@Field(() => String, { nullable: true })
	public title?: Nullable<string>;

	@Field(() => GraphQLBoolean, { nullable: true })
	public disabled?: Nullable<boolean>;

	@Field(() => [CreateCourseClassVideoInput], { nullable: true })
	public videosToCreate?: Nullable<CreateCourseClassVideoInput[]>;

	@Field(() => [UpdateCourseClassDeleteVideoInput], { nullable: true })
	public videosToDelete?: Nullable<UpdateCourseClassDeleteVideoInput[]>;
}

@Resolver(() => Schemas.CourseClass)
export class CourseClass {
	// region Mutations
	// @Mutation(() => Schemas.CourseClass, { nullable: true })
	// @Authenticated([UserRoleName.Admin])
	// public async createCourseClass(
	// 	@Arg("courseClass") courseClass: CreateCourseClassInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.CourseClass> {
	// 	const result = await Mutations.CourseClass.create({
	// 		data: courseClass,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => Schemas.CourseClass, { nullable: true })
	// @Authenticated([UserRoleName.Admin])
	// public async updateCourseClass(
	// 	@Arg("id", () => Int) id: number,
	// 	@Arg("values") values: UpdateCourseClassInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.CourseClass> {
	// 	const userId = context.me!.id;

	// 	const courseClassValidation = await Validators.CourseClass.validateUpdateData({
	// 		...values,
	// 		id,
	// 	});

	// 	let videosToCreateHaveErrors = false;
	// 	const videosToCreateErrors: Array<
	// 		| {
	// 				name?: Errors.BadUserInput | Errors.BadUserInput[];
	// 				urls?: Validators.VideoQuality.InvalidatedFromUrls;
	// 		  }
	// 		| undefined
	// 	> = [];
	// 	const validatedVideosToCreate: Validators.Video.ValidatedCreateData[] = [];
	// 	const validatedVideoQualitiesToCreate: Map<number, Validators.VideoQuality.ValidatedFromUrls> = new Map();

	// 	if (values.videosToCreate) {
	// 		const courseClassVideos = await Data.Video.findAll({
	// 			courseClassId: id,
	// 		});
	// 		let lastPosition = courseClassVideos.reduce(
	// 			(previousValue, currentValue) => Math.max(currentValue.position, previousValue),
	// 			0
	// 		);

	// 		for (const video of values.videosToCreate) {
	// 			const videoValidation = await Validators.Video.validateData({
	// 				name: video.name,
	// 				courseClassId: id,
	// 				position: ++lastPosition,
	// 			});
	// 			const urlValidation = await Validators.VideoQuality.validateFromUrls(video.urls);

	// 			let videoErrors:
	// 				| {
	// 						name?: Errors.BadUserInput | Errors.BadUserInput[];
	// 						urls?: Validators.VideoQuality.InvalidatedFromUrls;
	// 				  }
	// 				| undefined;

	// 			if (videoValidation[0] && urlValidation[0]) {
	// 				const index = validatedVideosToCreate.push(videoValidation[1]);

	// 				validatedVideoQualitiesToCreate.set(index, urlValidation[1]);
	// 			} else {
	// 				videoErrors =
	// 					!videoValidation[0] || !urlValidation[0]
	// 						? {
	// 								...(!videoValidation[0] ? videoValidation[1] : undefined),
	// 								urls: !urlValidation[0] ? urlValidation[1] : undefined,
	// 						  }
	// 						: undefined;
	// 				videosToCreateHaveErrors = true;
	// 			}

	// 			videosToCreateErrors.push(videoErrors);
	// 		}
	// 	}

	// 	if (!courseClassValidation[0] || videosToCreateHaveErrors) {
	// 		const errorData: Validators.CourseClass.InvalidatedUpdateData & {
	// 			videosToCreate?: Array<
	// 				| {
	// 						name?: Errors.BadUserInput | Errors.BadUserInput[];
	// 						urls?: Validators.VideoQuality.InvalidatedFromUrls;
	// 				  }
	// 				| undefined
	// 			>;
	// 		} = {};

	// 		if (!courseClassValidation[0]) {
	// 			const courseClassErrors = courseClassValidation[1];

	// 			errorData.title = courseClassErrors.title;
	// 			errorData.number = courseClassErrors.number;
	// 		}

	// 		if (videosToCreateHaveErrors) errorData.videosToCreate = videosToCreateErrors;

	// 		throw Errors.BadUserInputError(errorData);
	// 	}

	// 	await Mutations.CourseClass.updateFromValidatedData({
	// 		userId: context.me!.id,
	// 		data: {
	// 			...courseClassValidation[1],
	// 		},
	// 	});

	// 	if (values.videosToDelete)
	// 		await Promise.all(values.videosToDelete.map(({ id }) => Mutations.Video.deleteVideo({ id, userId })));

	// 	await Promise.all(
	// 		validatedVideosToCreate.map(
	// 			(videoData, index) =>
	// 				new Promise(async resolve => {
	// 					const video = await Mutations.Video.createFromValidatedData({ data: videoData, userId });
	// 					const videoQualities = validatedVideoQualitiesToCreate.get(index);

	// 					if (videoQualities)
	// 						await Promise.all(
	// 							videoQualities.map(v =>
	// 								Mutations.VideoQuality.createFromValidatedData({
	// 									userId,
	// 									videoId: video.id,
	// 									data: v,
	// 								})
	// 							)
	// 						);

	// 					resolve();
	// 				})
	// 		)
	// 	);

	// 	return Data.CourseClass.findOneOrThrow({ id });
	// }

	// @Mutation(() => GraphQLBoolean)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async deleteCourseClass(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
	// 	await Mutations.CourseClass.deleteCourseClass({ id, userId: context.me!.id });

	// 	return true;
	// }
	// endregion

	// region Queries
	@Query(() => [Schemas.CourseClass], { complexity: options => options.childComplexity + 1 })
	public async latestCourseClasses(): Promise<Models.CourseClass[]> {
		return Data.CourseClass.findAllLatest();
	}

	@Query(() => Schemas.CourseClass, { nullable: true })
	public async courseClass(@Arg("id", () => Int) id: number): Promise<Models.CourseClass> {
		return Data.CourseClass.findOneOrThrow({
			id,
		});
	}

	@Query(() => Schemas.CourseClass, { nullable: true })
	@Authenticate()
	public async courseClassByClassNo(
		@Arg("courseCode", () => String) courseCode: string,
		@Arg("classNo", () => Int) classNo: number
	): Promise<Models.CourseClass> {
		const course = await Data.Course.findOneOrThrow({
			code: courseCode,
		});

		const courseEditions = await Data.CourseEdition.findAll({ courseId: course.id });
		const courseEdition = courseEditions.length > 0 ? courseEditions[0] : undefined;
		const courseClassLists = courseEdition
			? await Data.CourseClassList.findAll({ courseEditionId: courseEdition.id })
			: undefined;

		if (!courseClassLists || courseClassLists.length === 0)
			throw new Errors.ObjectNotFoundError("No se encontró la clase.");

		return Data.CourseClass.findOneOrThrow({
			number: classNo,
			courseClassListId: courseClassLists[0].id,
		});
	}
	// endregion

	// region FieldResolvers
	@FieldResolver(() => [Schemas.Video])
	public async videos(@Root() courseClass: Models.CourseClass): Promise<Models.Video[]> {
		if (courseClass.id === undefined) return [];

		return Data.Video.findAll({ courseClassId: courseClass.id });
	}

	@FieldResolver(() => Schemas.CourseClassList, { nullable: true })
	public async courseClassList(@Root() courseClass: Models.CourseClass): Promise<Models.CourseClassList | null> {
		if (!courseClass.courseClassListId) return null;

		return Data.CourseClassList.findOne({
			id: courseClass.courseClassListId,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseclass: Models.CourseClass): Promise<Models.User | null> {
		if (typeof courseclass.createdById !== "number") return null;

		return Data.User.findOne({ id: courseclass.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseclass: Models.CourseClass): Promise<Models.User | null> {
		if (typeof courseclass.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseclass.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseclass: Models.CourseClass): Promise<Models.User | null> {
		if (typeof courseclass.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseclass.deletedById });
	}
	// endregion
}
