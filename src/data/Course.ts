import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getData, getNotDeletedCondition, notDisabledCondition } from "./Base";

export type FindAllOptions = {
	includeDeleted?: boolean;
	includeDisabled?: boolean;
};
export const findAll = async (options: FindAllOptions): Promise<Models.Course[]> => {
	const { courses } = await getData();

	if (!options.includeDeleted && !options.includeDisabled) return courses;

	let where: WhereOptions = {};

	if (!options.includeDisabled) where = { ...where, ...notDisabledCondition };
	if (!options.includeDeleted) where = { ...where, ...getNotDeletedCondition() };

	return Models.Course.findAll({ where });
};

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
export const findOne = async (options: FindOneOptions): Promise<Models.Course | undefined> => {
	const { courseById, courseByCode } = await getData();

	if (!options.includeDeleted && !options.includeDisabled)
		return options.id !== undefined ? courseById.get(options.id) : courseByCode.get(options.code);

	let where: WhereOptions = {};

	if (!options.includeDisabled) where = { ...where, ...notDisabledCondition };
	if (!options.includeDeleted) where = { ...where, ...getNotDeletedCondition() };

	where = { [Op.and]: [where, options.id === undefined ? { code: options.code } : { id: options.id }] };

	const course = await Models.Course.findOne({ where });

	return course ? course : undefined;
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.Course> => {
	const course = await findOne(options);

	if (!course) throw new Errors.ObjectNotFoundError("El curso no existe");

	return course;
};
