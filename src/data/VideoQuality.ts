import * as Errors from "../errors";
import * as Models from "../models";

import { getData } from "./Base";

export type FindAllByVideoIdOptions = {
	videoId: number;
	includeDeleted?: boolean;
};
export const findAllByVideoId = async ({
	videoId,
	includeDeleted,
}: FindAllByVideoIdOptions): Promise<Models.VideoQuality[]> => {
	const { videoQualitiesByVideoId } = await getData();

	if (!includeDeleted) return videoQualitiesByVideoId.get(videoId) || [];

	return Models.VideoQuality.findAll({
		where: {
			videoId,
		},
	});
};

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = async ({ id, includeDeleted }: FindOneOptions): Promise<Models.VideoQuality | undefined> => {
	const { videoQualityById } = await getData();

	if (!includeDeleted) return videoQualityById.get(id);

	return (await Models.VideoQuality.findOne({ where: { id } })) || undefined;
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoQuality> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("La calidad de video no existe.");

	return result;
};
