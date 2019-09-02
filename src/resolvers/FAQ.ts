import { Arg, FieldResolver, Int, Query, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.FAQ)
export class FAQ {
	// region Queries
	@Query(() => Schemas.FAQ)
	public async faq(@Arg("id", () => Int) id: number): Promise<Schemas.FAQ> {
		return Data.FAQ.findOneOrThrow({ id });
	}

	@Query(() => [Schemas.FAQ])
	public faqs(): Promise<Schemas.FAQ[]> {
		return Data.FAQ.findAll({});
	}
	// endregion

	//region FieldResolvers

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() faq: Schemas.FAQ): Promise<Schemas.User | null> {
		if (typeof faq.createdById !== "number") return null;

		return Data.User.findOne({ id: faq.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() faq: Schemas.FAQ): Promise<Schemas.User | null> {
		if (typeof faq.updatedById !== "number") return null;

		return Data.User.findOne({ id: faq.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() faq: Schemas.FAQ): Promise<Schemas.User | null> {
		if (typeof faq.deletedById !== "number") return null;

		return Data.User.findOne({ id: faq.deletedById });
	}
	// endregion
}
