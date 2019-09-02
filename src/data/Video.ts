import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize/types";

export type FindAllOptions = {
	courseClassId: number;
	includeDeleted?: boolean | undefined;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.VideoTableRow[]>>({
	getCacheKey: options => [options.courseClassId, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoAttributes.courseClassId]: options.courseClassId,
		};

		if (!options.includeDeleted) where[Models.VideoAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.Video.findAll({
			where,
			order: [[Models.VideoAttributes.position, "ASC"]],
		}).then(videos => videos.map(v => v.toTableRow()));
	},
});

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.VideoTableRow | null>>({
	getCacheKey: options => [options.id, !!options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.VideoAttributes.id]: options.id,
		};

		if (!options.includeDeleted) where[Models.VideoAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.Video.findOne({
			where,
		}).then(v => v && v.toTableRow());
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.VideoTableRow> => {
	const video = await findOne(options);
	if (!video) throw new Errors.ObjectNotFoundError("El video no existe.");

	return video;
};
