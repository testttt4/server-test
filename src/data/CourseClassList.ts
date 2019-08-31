import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getDataHandler, getNotDeletedCondition } from "./Base";

export type FindAllOptions = {
	courseEditionId: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.CourseClassList[]>>({
	getCacheKey: options => [options.courseEditionId, !!options.includeDeleted, !!options.includeDisabled].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.CourseClassListAttributes.courseEditionId]: options.courseEditionId,
		};

		if (!options.includeDeleted)
			where[Models.CourseClassListAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseClassListAttributes.status] = { [Op.not]: Models.CourseClassListStatus.disabled };

		return Models.CourseClassList.findAll({
			where,
		});
	},
});

export type FindOne = {
	id: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findOne = getDataHandler<(options: FindOne) => Promise<Models.CourseClassList | undefined>>({
	getCacheKey: options => [options.id, !!options.includeDeleted, !!options.includeDisabled].join("."),
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.CourseClassListAttributes.id]: options.id,
		};

		if (!options.includeDeleted)
			where[Models.CourseClassListAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled)
			where[Models.CourseClassListAttributes.status] = { [Op.not]: Models.CourseClassListStatus.disabled };

		return (await Models.CourseClassList.findOne({ where })) || undefined;
	},
});

export const findOneOrThrow = async (options: FindOne): Promise<Models.CourseClassList> => {
	const courseClassList = await findOne(options);
	if (!courseClassList) throw new Errors.ObjectNotFoundError("La lista de clases no existe");

	return courseClassList;
};
