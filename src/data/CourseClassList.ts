import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getData, getNotDeletedCondition, notDisabledCondition } from "./Base";

export type FindAll = {
	courseId: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findAll = async (options: FindAll): Promise<Models.CourseClassList[]> => {
	const { courseClassListsByCourseId } = await getData();

	if (!options.includeDeleted && !options.includeDisabled)
		return courseClassListsByCourseId.get(options.courseId) || [];

	let where: WhereOptions = {
		courseId: options.courseId,
	};

	if (!options.includeDisabled) where = { ...where, ...notDisabledCondition };
	if (!options.includeDeleted) where = { ...where, ...getNotDeletedCondition() };

	return Models.CourseClassList.findAll({ where });
};

export type FindOne = {
	id: number;
	includeDisabled?: boolean;
	includeDeleted?: boolean;
};
export const findOne = async (options: FindOne): Promise<Models.CourseClassList | undefined> => {
	const { courseClassListById } = await getData();

	if (!options.includeDeleted && !options.includeDisabled) return courseClassListById.get(options.id);

	let where: WhereOptions = {
		id: options.id,
	};

	if (!options.includeDisabled) where = { [Op.and]: [where, notDisabledCondition] };
	if (!options.includeDeleted) where = { [Op.and]: [where, getNotDeletedCondition()] };

	return (await Models.CourseClassList.findOne({ where })) || undefined;
};

export const findOneOrThrow = async (options: FindOne): Promise<Models.CourseClassList> => {
	const courseClassList = await findOne(options);
	if (!courseClassList) throw new Errors.ObjectNotFoundError("La lista de clases no existe");

	return courseClassList;
};
