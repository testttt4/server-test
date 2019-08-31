import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize";

export type FindAllByVideoQualityOptions = {
	videoQualityId: number;
	includeDeleted?: boolean;
};
export const findAllByVideoQuality = getDataHandler<
	(options: FindAllByVideoQualityOptions) => Promise<Models.VideoFormat[]>
>({
	getCacheKey: options => [options.videoQualityId, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoFormatAttributes.videoQualityId]: options.videoQualityId,
		};

		if (!options.includeDeleted) where[Models.VideoFormatAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.VideoFormat.findAll({
			where,
		});
	},
});

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.VideoFormat | null>>({
	getCacheKey: options => [options.id, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoFormatAttributes.id]: options.id,
		};

		if (!options.includeDeleted) where[Models.VideoFormatAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.VideoFormat.findOne({
			where,
		});
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoFormat> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("El formato no existe");

	return result;
};
