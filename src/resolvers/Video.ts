import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { Ctx, FieldResolver, Info, Resolver, Root } from "type-graphql";

import { Context } from "../Context";
import { GraphQLResolveInfo } from "graphql";

@Resolver(() => Schemas.Video)
export class Video {
	// region FieldResolvers
	@FieldResolver(() => [Schemas.VideoQuality])
	public async qualities(@Root() video: { id?: number }): Promise<Models.VideoQuality[]> {
		if (video.id === undefined) return [];

		return Data.VideoQuality.findAllByVideoId({
			videoId: video.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(
		@Root() video: { createdBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (video.createdBy === undefined) return null;

		return (await Data.User.findOne({ id: video.createdBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(
		@Root() video: { updatedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (video.updatedBy === undefined) return null;

		return (await Data.User.findOne({ id: video.updatedBy })) || null;
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(
		@Root() video: { deletedBy?: number },
		@Info() info: GraphQLResolveInfo,
		@Ctx() context: Context
	): Promise<Models.User | null> {
		if (video.deletedBy === undefined) return null;

		return (await Data.User.findOne({ id: video.deletedBy })) || null;
	}
	// endregion
}
