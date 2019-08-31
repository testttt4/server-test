import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getDataHandler, getNotDeletedCondition } from "./Base";

export type FindAllOptions = {
	includeDeleted?: boolean;
	includeDisabled?: boolean;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.Course[]>>({
	getCacheKey: options => `${!!options.includeDeleted}.${!!options.includeDisabled}`,
	calculate: async (config, options) => {
		const where: WhereOptions = {};

		if (!options.includeDeleted) where[Models.CourseAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseAttributes.visibility] = { [Op.not]: Models.CourseVisibility.public };

		return Models.Course.findAll({ where });
	},
});

export type FindOneOptions = ({
	includeDeleted?: boolean;
	includeDisabled?: boolean;
}) &
	(
		| {
				id: number;
				code?: undefined;
		  }
		| {
				id?: undefined;
				code: string;
		  });
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.Course | null>>({
	getCacheKey: options => `${options.id}.${options.code}.${!!options.includeDeleted}.${!!options.includeDisabled}`,
	calculate: async (config, options) => {
		const where: WhereOptions =
			options.id !== undefined
				? { [Models.CourseAttributes.id]: options.id }
				: { [Models.CourseAttributes.code]: options.code };

		if (!options.includeDeleted) where[Models.CourseAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseAttributes.visibility] = { [Op.not]: Models.CourseVisibility.public };

		return Models.Course.findOne({
			where,
		});
	},
});
export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.Course> => {
	const course = await findOne(options);

	if (!course) throw new Errors.ObjectNotFoundError("El curso no existe");

	return course;
};
