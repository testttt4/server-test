import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getDataHandler, getNotDeletedCondition } from "./Base";

export type FindAllOptions = {
	courseId: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.CourseEdition[]>>({
	getCacheKey: options => [options.courseId, !!options.includeDeleted, !!options.includeDisabled].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.CourseEditionAttributes.courseId]: options.courseId,
		};

		if (!options.includeDeleted)
			where[Models.CourseEditionAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseEditionAttributes.visibility] = { [Op.not]: Models.CourseEditionVisibility.disabled };

		return Models.CourseEdition.findAll({
			where,
		});
	},
});

export type FindOne = {
	id: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOne) => Promise<Models.CourseEdition | null>>({
	getCacheKey: options => [options.id, !!options.includeDeleted, !!options.includeDisabled].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.CourseEditionAttributes.id]: options.id,
		};

		if (!options.includeDeleted)
			where[Models.CourseEditionAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseEditionAttributes.visibility] = { [Op.not]: Models.CourseEditionVisibility.disabled };

		return await Models.CourseEdition.findOne({ where });
	},
});

export const findOneOrThrow = async (options: FindOne): Promise<Models.CourseEdition> => {
	const courseEdition = await findOne(options);
	if (!courseEdition) throw new Errors.ObjectNotFoundError("CourseEdition not found");

	return courseEdition;
};
