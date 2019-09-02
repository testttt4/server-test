import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { FieldResolver, Resolver, Root } from "type-graphql";

@Resolver(() => Schemas.Video)
export class Video {
	// region FieldResolvers
	@FieldResolver(() => [Schemas.VideoQuality])
	public async qualities(@Root() video: Models.Video): Promise<Models.VideoQuality[]> {
		if (video.id === undefined) return [];

		return Data.VideoQuality.findAllByVideoId({
			videoId: video.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() video: Models.Video): Promise<Models.User | null> {
		if (typeof video.createdById !== "number") return null;

		return Data.User.findOne({ id: video.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() video: Models.Video): Promise<Models.User | null> {
		if (typeof video.updatedById !== "number") return null;

		return Data.User.findOne({ id: video.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() video: Models.Video): Promise<Models.User | null> {
		if (typeof video.deletedById !== "number") return null;

		return Data.User.findOne({ id: video.deletedById });
	}
	// endregion
}
