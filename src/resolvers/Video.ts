import { FieldResolver, Resolver, Root } from "type-graphql";
import * as Data from "../data";
import * as Schemas from "../schemas";

@Resolver(() => Schemas.Video)
export class Video {
	// region FieldResolvers
	@FieldResolver(() => [Schemas.VideoQuality])
	public async qualities(@Root() video: Schemas.Video): Promise<Schemas.VideoQuality[]> {
		if (video.id === undefined) return [];

		return Data.VideoQuality.findAllByVideoId({
			videoId: video.id,
		});
	}

	@FieldResolver(() => Schemas.CourseClass, { nullable: true })
	public async courseClass(@Root() video: Schemas.Video): Promise<Schemas.CourseClass | null> {
		if (typeof video.courseClassId !== "number") return null;

		return Data.CourseClass.findOne({
			id: video.courseClassId,
		});
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async createdBy(@Root() video: Schemas.Video): Promise<Schemas.User | null> {
		if (typeof video.createdById !== "number") return null;

		return Data.User.findOne({ id: video.createdById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async updatedBy(@Root() video: Schemas.Video): Promise<Schemas.User | null> {
		if (typeof video.updatedById !== "number") return null;

		return Data.User.findOne({ id: video.updatedById });
	}

	@FieldResolver(() => Schemas.User, { nullable: true })
	public async deletedBy(@Root() video: Schemas.Video): Promise<Schemas.User | null> {
		if (typeof video.deletedById !== "number") return null;

		return Data.User.findOne({ id: video.deletedById });
	}
	// endregion
}
