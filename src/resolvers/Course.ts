import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.Course)
export class Course {
	//#region Queries
	@Query(() => [Schemas.Course])
	public async courses(): Promise<Schemas.Course[]> {
		return Data.Course.findAll({});
	}

	@Query(() => Schemas.Course)
	public async courseById(@Arg("id", () => Int) id: number): Promise<Schemas.Course> {
		return Data.Course.findOneOrThrow({
			id,
			includeDisabled: true,
		});
	}

	@Query(() => Schemas.Course, { nullable: true })
	public async courseByCode(@Arg("code", () => String) code: string): Promise<Schemas.Course> {
		return Data.Course.findOneOrThrow({
			code: code.trim(),
			includeDisabled: true,
		});
	}
	//#endregion

	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseEdition])
	public async editions(@Root() course: Schemas.Course): Promise<Schemas.CourseEdition[]> {
		return Data.CourseEdition.findAll({
			courseId: course.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() course: Schemas.Course): Promise<Schemas.User | null> {
		if (typeof course.createdById !== "number") return null;

		return Data.User.findOne({ id: course.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() course: Schemas.Course): Promise<Schemas.User | null> {
		if (typeof course.updatedById !== "number") return null;

		return Data.User.findOne({ id: course.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() course: Schemas.Course): Promise<Schemas.User | null> {
		if (typeof course.deletedById !== "number") return null;

		return Data.User.findOne({ id: course.deletedById });
	}
	//#endregion
}
