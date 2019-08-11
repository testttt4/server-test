import * as Errors from "../errors";
import * as Models from "../models";

import { getData } from "./Base";

export type FindAllByVideoQualityOptions = {
	videoQualityId: number;
	includeDeleted?: boolean;
};
export const findAllByVideoQuality = async ({
	videoQualityId,
	includeDeleted,
}: FindAllByVideoQualityOptions): Promise<Models.VideoFormat[]> => {
	const { videoFormatsByVideoQualityId } = await getData();

	if (!includeDeleted) return videoFormatsByVideoQualityId.get(videoQualityId) || [];

	return Models.VideoFormat.findAll({
		where: {
			videoQualityId,
		},
	});
};

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = async ({ id, includeDeleted }: FindOneOptions): Promise<Models.VideoFormat | undefined> => {
	const { videoFormatById } = await getData();

	if (!includeDeleted) return videoFormatById.get(id);

	return (
		(await Models.VideoFormat.findOne({
			where: {
				id,
			},
		})) || undefined
	);
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoFormat> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("El formato no existe");

	return result;
};
