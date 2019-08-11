import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { Ctx, FieldResolver, Info, Resolver, Root } from "type-graphql";

import { Context } from "../Context";
import { GraphQLResolveInfo } from "graphql";

@Resolver(() => Schemas.VideoFormat)
export class VideoFormat {
	// region FieldResolvers
	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(
		@Root() videoFormat: any,

		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoFormat.createdBy === undefined) return null;

		return (await Data.User.findOne({ id: videoFormat.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(
		@Root() videoFormat: { updatedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoFormat.updatedBy === undefined) return null;

		return (await Data.User.findOne({ id: videoFormat.updatedBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(
		@Root() videoFormat: { deletedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoFormat.deletedBy === undefined) return null;

		return (await Data.User.findOne({ id: videoFormat.deletedBy })) || null;
	}
	// endregion
}
