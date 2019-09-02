import { GraphQLBoolean } from "graphql";
import { Arg, Field, FieldResolver, InputType, Int, Query, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";
import { Nullable } from "../typings/helperTypes";

@InputType()
export class CreateFAQInput {
	@Field(() => String)
	public title: string;

	@Field(() => String)
	public content: string;

	@Field(() => GraphQLBoolean)
	public isHTML: boolean;
}

@InputType()
export class UpdateFAQInput {
	@Field(() => String, { nullable: true })
	public title: Nullable<string>;

	@Field(() => String, { nullable: true })
	public content: Nullable<string>;

	@Field(() => GraphQLBoolean, { nullable: true })
	public isHTML: Nullable<boolean>;
}

@Resolver(() => Schemas.FAQ)
export class FAQ {
	// region Mutations
	// @Mutation(() => Schemas.FAQ)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async createFAQ(@Arg("data") data: CreateFAQInput, @Ctx() context: Context): Promise<Models.FAQ> {
	// 	const result = await Mutations.FAQ.create({
	// 		data,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => Schemas.FAQ)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async updateFAQ(
	// 	@Arg("id", () => Int) id: number,
	// 	@Arg("data") data: UpdateFAQInput,
	// 	@Ctx() context: Context
	// ): Promise<Models.FAQ> {
	// 	const result = await Mutations.FAQ.update({
	// 		id,
	// 		data,
	// 		userId: context.me!.id,
	// 	});

	// 	if (!result[0]) throw Errors.BadUserInputError(result[1]);

	// 	return result[1];
	// }

	// @Mutation(() => GraphQLBoolean)
	// @Authenticated([Models.UserRoleName.Admin])
	// public async deleteFAQ(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
	// 	await Mutations.FAQ.deleteFAQ({ id, userId: context.me!.id });

	// 	return true;
	// }
	// endregion

	// region Queries
	@Query(() => Schemas.FAQ)
	public async faq(@Arg("id", () => Int) id: number): Promise<Models.FAQ> {
		return Data.FAQ.findOneOrThrow({ id });
	}

	@Query(() => [Schemas.FAQ])
	public faqs(): Promise<Models.FAQ[]> {
		return Data.FAQ.findAll({});
	}
	// endregion

	//region FieldResolvers

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() faq: Models.FAQ): Promise<Models.User | null> {
		if (typeof faq.createdById !== "number") return null;

		return Data.User.findOne({ id: faq.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() faq: Models.FAQ): Promise<Models.User | null> {
		if (typeof faq.updatedById !== "number") return null;

		return Data.User.findOne({ id: faq.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() faq: Models.FAQ): Promise<Models.User | null> {
		if (typeof faq.deletedById !== "number") return null;

		return Data.User.findOne({ id: faq.deletedById });
	}
	// endregion
}
