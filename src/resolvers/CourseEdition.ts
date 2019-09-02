import { FieldResolver, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.CourseEdition)
export class CourseEdition {
	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClassList], { nullable: true })
	public async courseClassLists(@Root() courseEdition: Schemas.CourseEdition): Promise<Schemas.CourseClassList[]> {
		return Data.CourseClassList.findAll({ courseEditionId: courseEdition.id });
	}

	@FieldResolver(() => Schemas.Course, { nullable: true })
	public async course(@Root() courseEdition: Schemas.CourseEdition): Promise<Schemas.Course | null> {
		return Data.Course.findOne({
			id: courseEdition.courseId,
			includeDisabled: true,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseEdition: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseEdition.createdById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseEdition: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseEdition.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseEdition: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseEdition.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.deletedById });
	}
	//#endregion
}
