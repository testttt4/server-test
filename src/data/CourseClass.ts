import * as CourseClassList from "./CourseClassList";
import * as Errors from "../errors";
import * as Models from "../models";

import { getData, getNotDeletedCondition, notDisabledCondition } from "./Base";

import { WhereOptions } from "sequelize";

export type FindAllOptions = {
	courseClassListId: number;
	includeDeleted?: boolean;
	includeDisabled?: boolean;
};
export const findAll = async (options: FindAllOptions): Promise<Models.CourseClass[]> => {
	const { courseClassesByCourseClassListId } = await getData();

	await CourseClassList.findOneOrThrow({ id: options.courseClassListId });

	if (!options.includeDeleted && !options.includeDisabled)
		return courseClassesByCourseClassListId.get(options.courseClassListId) || [];

	let where: WhereOptions = {
		courseClassListId: options.courseClassListId,
	};

	if (!options.includeDisabled) where = { ...where, ...notDisabledCondition };
	if (!options.includeDeleted) where = { ...where, ...getNotDeletedCondition() };

	return Models.CourseClass.findAll({ where });
};

export const findAllLatest = async (): Promise<Models.CourseClass[]> => {
	return (await getData()).latestCourseClasses;
};

export type FindOneOptions = {
	includeDisabled?: boolean;
	includeDeleted?: boolean;
} & (
	| {
			id: number;

			courseClassListId?: undefined;
			number?: undefined;
	  }
	| {
			id?: undefined;

			courseClassListId: number;
			number: number;
	  });
export const findOne = async (options: FindOneOptions): Promise<Models.CourseClass | undefined> => {
	const { courseClassById, courseClassesByCourseClassListId } = await getData();

	if (!options.includeDeleted && !options.includeDisabled)
		if (options.id === undefined) {
			const courseClassList = courseClassesByCourseClassListId.get(options.courseClassListId);

			if (courseClassList !== undefined)
				return courseClassList
					? courseClassList.find(courseClass => courseClass.number === options.number)
					: undefined;
		} else return courseClassById.get(options.id);

	let where: WhereOptions =
		options.id !== undefined
			? { id: options.id }
			: { courseClassListId: options.courseClassListId, number: options.number };

	if (!options.includeDisabled) where = { ...where, ...notDisabledCondition };
	if (!options.includeDeleted) where = { ...where, ...getNotDeletedCondition() };

	return (await Models.CourseClass.findOne({ where })) || undefined;
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.CourseClass> => {
	const courseClass = await findOne(options);
	if (!courseClass) throw new Errors.ObjectNotFoundError("La clase no existe");

	return courseClass;
};
