import * as Errors from "../errors";
import * as Models from "../models";

import { WhereOptions } from "sequelize";
import { getData } from "./Base";

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
export const findOne = async (options: FindOneOptions): Promise<Models.User | undefined> => {
	const { userById, userByUid } = await getData();

	if (!options.includeDeleted)
		return options.id !== undefined ? userById.get(options.id) : userByUid.get(options.uid);

	const where: WhereOptions = {};

	if (options.id !== undefined) where.id = options.id;
	else where.email = options.uid;

	return (await Models.User.findOne({ where })) || undefined;
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.User> => {
	const result = await findOne(options);
	if (!result) throw new Errors.ObjectNotFoundError("El usuario existe");

	return result;
};
