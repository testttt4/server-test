import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Errors from "../errors";
import { Authenticate } from "../middlewares/Authenticate";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.CourseClass)
export class CourseClass {
	// region Queries
	@Query(() => [Schemas.CourseClass], { complexity: options => options.childComplexity + 1 })
	public async latestCourseClasses(): Promise<Schemas.CourseClass[]> {
		return Data.CourseClass.findAllLatest();
	}

	@Query(() => Schemas.CourseClass, { nullable: true })
	public async courseClass(@Arg("id", () => Int) id: number): Promise<Schemas.CourseClass> {
		return Data.CourseClass.findOneOrThrow({
			id,
		});
	}

	@Query(() => Schemas.CourseClass, { nullable: true })
	@Authenticate()
	public async courseClassByClassNo(
		@Arg("courseCode", () => String) courseCode: string,
		@Arg("classNo", () => Int) classNo: number
	): Promise<Schemas.CourseClass> {
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
	public async videos(@Root() courseClass: Schemas.CourseClass): Promise<Schemas.Video[]> {
		if (courseClass.id === undefined) return [];

		return Data.Video.findAll({ courseClassId: courseClass.id });
	}

	@FieldResolver(() => Schemas.CourseClassList, { nullable: true })
	public async courseClassList(@Root() courseClass: Schemas.CourseClass): Promise<Schemas.CourseClassList | null> {
		if (!courseClass.courseClassListId) return null;

		return Data.CourseClassList.findOne({
			id: courseClass.courseClassListId,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseclass: Schemas.CourseClass): Promise<Schemas.User | null> {
		if (typeof courseclass.createdById !== "number") return null;

		return Data.User.findOne({ id: courseclass.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseclass: Schemas.CourseClass): Promise<Schemas.User | null> {
		if (typeof courseclass.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseclass.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseclass: Schemas.CourseClass): Promise<Schemas.User | null> {
		if (typeof courseclass.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseclass.deletedById });
	}
	// endregion
}
