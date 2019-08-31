import * as Errors from "../errors";
import * as Models from "../models";

import { getDataHandler, getNotDeletedCondition } from "./Base";

import { WhereOptions } from "sequelize";

export type FindOneOptions = {
	includeDeleted?: boolean;
} & (
	| {
			id: number;
			uid?: undefined;
	  }
	| {
			id?: undefined;
			uid: string;
	  });
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.User | null>>({
	getCacheKey: options => [options.id, options.includeDeleted].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions =
			options.id !== undefined
				? { [Models.UserAttributes.id]: options.id }
				: { [Models.UserAttributes.uid]: options.uid };

		if (!options.includeDeleted) where[Models.UserAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		return Models.User.findOne({
			where,
		});
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.User> => {
	const result = await findOne(options);
	if (!result) throw new Errors.ObjectNotFoundError("El usuario existe");

	return result;
};
