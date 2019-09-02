import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { FieldResolver, Resolver, Root } from "type-graphql";

@Resolver(() => Schemas.VideoQuality)
export class VideoQuality {
	// region FieldResolvers
	@FieldResolver(() => [Schemas.VideoFormat])
	public async formats(@Root() videoQuality: Models.VideoQuality): Promise<Models.VideoFormat[]> {
		return Data.VideoFormat.findAllByVideoQuality({
			videoQualityId: videoQuality.id,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() videoQuality: Models.VideoQuality): Promise<Models.User | null> {
		if (typeof videoQuality.createdById !== "number") return null;

		return Data.User.findOne({ id: videoQuality.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() videoQuality: Models.VideoQuality): Promise<Models.User | null> {
		if (typeof videoQuality.updatedById !== "number") return null;

		return Data.User.findOne({ id: videoQuality.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() videoQuality: Models.VideoQuality): Promise<Models.User | null> {
		if (typeof videoQuality.deletedById !== "number") return null;

		return Data.User.findOne({ id: videoQuality.deletedById });
	}
	// endregion
}
