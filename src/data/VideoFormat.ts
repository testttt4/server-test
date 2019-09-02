import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize";

export type FindAllByVideoQualityOptions = {
	videoQualityId: number;
	includeDeleted?: boolean;
};
export const findAllByVideoQuality = getDataHandler<
	(options: FindAllByVideoQualityOptions) => Promise<Models.VideoFormatTableRow[]>
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
		}).then(videoFormats => videoFormats.map(vf => vf.toTableRow()));
	},
});

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.VideoFormatTableRow | null>>({
	getCacheKey: options => [options.id, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoFormatAttributes.id]: options.id,
		};

		if (!options.includeDeleted) where[Models.VideoFormatAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.VideoFormat.findOne({
			where,
		}).then(vf => vf && vf.toTableRow());
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoFormatTableRow> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("El formato no existe");

	return result;
};
