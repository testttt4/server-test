import { FieldResolver, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.CourseClassList)
export class CourseClassList {
	//#region FieldResolvers
	@FieldResolver(() => [Schemas.CourseClass], { nullable: true })
	public async classes(@Root() courseClassList: Schemas.CourseClassList): Promise<Schemas.CourseClass[]> {
		if (typeof courseClassList.id !== "number") return [];

		return Data.CourseClass.findAll({ courseClassListId: courseClassList.id });
	}

	@FieldResolver(() => Schemas.CourseEdition, { nullable: true })
	public async courseEdition(@Root() root: Schemas.CourseClassList): Promise<Schemas.CourseEdition | null> {
		if (!root.courseEditionId) return null;

		return Data.CourseEdition.findOne({
			id: root.courseEditionId,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() courseclasslist: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseclasslist.createdById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() courseclasslist: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseclasslist.updatedById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() courseclasslist: Schemas.CourseClassList): Promise<Schemas.User | null> {
		if (typeof courseclasslist.deletedById !== "number") return null;

		return Data.User.findOne({ id: courseclasslist.deletedById });
	}
	//#endregion
}
