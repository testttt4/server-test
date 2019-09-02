import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize";

export type FindAllOptions = {
	includeDeleted?: boolean;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.FAQTableRow[]>>({
	getCacheKey: options => [options.includeDeleted].join("."),
	calculate: async (config, params) => {
		const where: WhereOptions = {};

		if (!params.includeDeleted) where[Models.FAQAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.FAQ.findAll({
			where,
		}).then(faqs => faqs.map(f => f.toTableRow()));
	},
});

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.FAQTableRow | null>>({
	getCacheKey: options => [options.id, options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.FAQAttributes.id]: options.id,
		};

		if (!options.includeDeleted) where[Models.FAQAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.FAQ.findOne({
			where,
		}).then(f => f && f.toTableRow());
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.FAQTableRow> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("La faq no existe");

	return result;
};
