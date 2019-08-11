import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";
import * as Mutations from "../mutations";
import * as Schemas from "../schemas";

import { Arg, Ctx, Field, FieldResolver, Info, InputType, Int, Mutation, Query, Resolver, Root } from "type-graphql";
import { GraphQLBoolean, GraphQLResolveInfo } from "graphql";

import { Authenticated } from "../middlewares";
import { Context } from "../Context";
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
	@Mutation(() => Schemas.FAQ)
	@Authenticated([Models.UserRoleName.Admin])
	public async createFAQ(@Arg("data") data: CreateFAQInput, @Ctx() context: Context): Promise<Models.FAQ> {
		const result = await Mutations.FAQ.create({
			data,
			userId: context.me!.id,
		});

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => Schemas.FAQ)
	@Authenticated([Models.UserRoleName.Admin])
	public async updateFAQ(
		@Arg("id", () => Int) id: number,
		@Arg("data") data: UpdateFAQInput,
		@Ctx() context: Context
	): Promise<Models.FAQ> {
		const result = await Mutations.FAQ.update({
			id,
			data,
			userId: context.me!.id,
		});

		if (!result[0]) throw Errors.BadUserInputError(result[1]);

		return result[1];
	}

	@Mutation(() => GraphQLBoolean)
	@Authenticated([Models.UserRoleName.Admin])
	public async deleteFAQ(@Arg("id", () => Int) id: number, @Ctx() context: Context): Promise<boolean> {
		await Mutations.FAQ.deleteFAQ({ id, userId: context.me!.id });

		return true;
	}
	// endregion

	// region Queries
	@Query(() => Schemas.FAQ)
	public async faq(
		@Arg("id", () => Int) id: number,
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.FAQ> {
		return Data.FAQ.findOneOrThrow({ id });
	}

	@Query(() => [Schemas.FAQ])
	public faqs(@Info() info: GraphQLResolveInfo, @Ctx() context: Context): Promise<Models.FAQ[]> {
		return Data.FAQ.findAll({});
	}
	// endregion

	//region FieldResolvers
	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(
		@Root() faq: { createdBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (typeof faq.createdBy !== "number") return null;

		return (await Data.User.findOne({ id: faq.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(
		@Root() faq: { updatedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (typeof faq.updatedBy !== "number") return null;

		return (await Data.User.findOne({ id: faq.updatedBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(
		@Root() faq: { deletedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (typeof faq.deletedBy !== "number") return null;

		return (await Data.User.findOne({ id: faq.deletedBy })) || null;
	}
	// endregion
}
