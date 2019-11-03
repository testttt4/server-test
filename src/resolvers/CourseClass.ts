import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Errors from "../errors";
import { Authenticate } from "../middlewares/Authenticate";
import * as Schemas from "../schemas";
import { logger } from "../utils/logger";

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
		let course = await Data.Course.findOne({
			code: courseCode,
		});

		if (course) {
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

		const getCleanReadCourseCode = (code: string): [string, number | null] => {
			let regex = /-?\d{4}$/;
			let match = code.match(regex);

			if (match) {
				const year = parseInt(match[0].replace(/\D/g, ""));

				if (!isNaN(year)) return [code.replace(regex, ""), year];
			}

			regex = /-?\d{2}$/;
			match = code.match(regex);

			if (match) {
				const year = parseInt(match[0].replace(/\D/g, ""));

				if (!isNaN(year)) return [code.replace(regex, ""), year + 2000];
			}

			return [code, null];
		};

		const [cleanCourseCode, year] = getCleanReadCourseCode(courseCode);
		course = await Data.Course.findOne({
			code: cleanCourseCode,
			includeDisabled: true,
		});

		if (!course || !year) {
			logger.info(`course not found ${courseCode} (${cleanCourseCode})`);
			throw new Errors.ObjectNotFoundError("El curso no existe");
		}

		const courseEditions = await Data.CourseEdition.findAll({
			courseId: course.id,
			includeDisabled: true,
		});
		const courseEdition =
			courseEditions.length > 0 ? courseEditions.find(ce => ce.year === year) || courseEditions[0] : undefined;
		const courseClassLists = courseEdition
			? await Data.CourseClassList.findAll({ courseEditionId: courseEdition.id, includeDisabled: true })
			: undefined;

		if (!courseClassLists || courseClassLists.length === 0) {
			logger.info(`courseClassLists not found ${courseEdition && courseEdition.id}`);
			throw new Errors.ObjectNotFoundError("No se encontró la clase.");
		}

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
