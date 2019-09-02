import * as Data from "../data";
import * as Models from "../models";
import * as Schemas from "../schemas";

import { FieldResolver, Resolver, Root } from "type-graphql";

@Resolver(() => Schemas.VideoFormat)
export class VideoFormat {
	// region FieldResolvers
	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() videoFormat: Models.VideoFormat): Promise<Models.User | null> {
		if (typeof videoFormat.createdById !== "number") return null;

		return Data.User.findOne({ id: videoFormat.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() videoFormat: Models.VideoFormat): Promise<Models.User | null> {
		if (typeof videoFormat.updatedById !== "number") return null;

		return Data.User.findOne({ id: videoFormat.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() videoFormat: Models.VideoFormat): Promise<Models.User | null> {
		if (typeof videoFormat.deletedById !== "number") return null;

		return Data.User.findOne({ id: videoFormat.deletedById });
	}
	// endregion
}
