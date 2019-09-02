import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize/types";

export type FindAllByVideoIdOptions = {
	videoId: number;
	includeDeleted?: boolean;
};
export const findAllByVideoId = getDataHandler<
	(options: FindAllByVideoIdOptions) => Promise<Models.VideoQualityTableRow[]>
>({
	getCacheKey: options => [options.videoId, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoQualityAttributes.videoId]: options.videoId,
		};

		if (!options.includeDeleted)
			where[Models.VideoQualityAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.VideoQuality.findAll({
			where,
		}).then(videoQualities => videoQualities.map(vq => vq.toTableRow()));
	},
});

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.VideoQualityTableRow | null>>({
	getCacheKey: options => [options.id, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoQualityAttributes.id]: options.id,
		};

		if (!options.includeDeleted)
			where[Models.VideoQualityAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.VideoQuality.findOne({
			where,
		}).then(vq => vq && vq.toTableRow());
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoQualityTableRow> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("La calidad de video no existe.");

	return result;
};
