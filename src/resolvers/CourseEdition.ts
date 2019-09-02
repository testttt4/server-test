import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { FieldResolver, Resolver, Root } from "type-graphql";

@Resolver(() => Schemas.CourseEdition)
export class CourseEdition {
	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClass], { nullable: true })
	public async courseClassLists(@Root() courseEdition: Models.CourseEdition): Promise<Models.CourseClassList[]> {
		return Data.CourseClassList.findAll({ courseEditionId: courseEdition.id });
	}

	@FieldResolver(() => Schemas.Course, { nullable: true })
	public async course(@Root() courseEdition: Models.CourseEdition): Promise<Models.Course | null> {
		return Data.Course.findOne({
			id: courseEdition.courseId,
			includeDisabled: true,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseEdition: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseEdition.createdById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseEdition: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseEdition.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseEdition: Models.CourseClassList): Promise<Models.User | null> {
		if (typeof courseEdition.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseEdition.deletedById });
	}
	//#endregion
}
