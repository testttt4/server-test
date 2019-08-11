import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { Ctx, FieldResolver, Info, Resolver, Root } from "type-graphql";

import { Context } from "../Context";
import { GraphQLResolveInfo } from "graphql";

@Resolver(() => Schemas.VideoQuality)
export class VideoQuality {
	// region FieldResolvers
	@FieldResolver(() => [Schemas.VideoFormat])
	public async formats(@Root() videoQuality: { id?: number }): Promise<Models.VideoFormat[]> {
		if (videoQuality.id === undefined) return [];

		return Data.VideoFormat.findAllByVideoQuality({
			videoQualityId: videoQuality.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(
		@Root() videoQuality: { createdBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoQuality.createdBy === undefined) return null;

		return (await Data.User.findOne({ id: videoQuality.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(
		@Root() videoQuality: { updatedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoQuality.updatedBy === undefined) return null;

		return (await Data.User.findOne({ id: videoQuality.updatedBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(
		@Root() videoQuality: { deletedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (videoQuality.deletedBy === undefined) return null;

		return (await Data.User.findOne({ id: videoQuality.deletedBy })) || null;
	}
	// endregion
}
