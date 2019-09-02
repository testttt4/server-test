import * as Errors from "../errors";
import * as Models from "../models";

import { Op, WhereOptions } from "sequelize";
import { getDataHandler, getNotDeletedCondition } from "./Base";

export type FindAllOptions = {
	courseClassListId: number;
	includeDeleted?: boolean;
	includeDisabled?: boolean;
};
export const findAll = getDataHandler<(options: FindAllOptions) => Promise<Models.CourseClass[]>>({
	getCacheKey: options => `${options.courseClassListId}.${!!options.includeDeleted}.${!!options.includeDisabled}`,
	calculate: async (config, options) => {
		const where: WhereOptions = {
			[Models.CourseClassAttributes.courseClassListId]: options.courseClassListId,
		};

		if (!options.includeDeleted) where[Models.CourseClassAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled) where[Models.CourseClassAttributes.disabled] = { [Op.or]: [null, false] };

		const res = await Models.CourseClass.findAll({ where });
		return res;
	},
});

export const findAllLatest = getDataHandler<() => Promise<Models.CourseClass[]>>({
	getCacheKey: () => `updates`,
	calculate: async () =>
		Models.CourseClass.findAll({
			where: { [Models.CourseClassAttributes.disabled]: { [Op.or]: [null, false] } },
			order: [[Models.CourseClassAttributes.createdAt, "DESC"]],
			limit: 20,
			include: [
				{
					model: Models.CourseClassList,
					as: Models.CourseClassRelations.courseClassList,
					attributes: [],
					where: {
						[Models.CourseClassListAttributes.visibility]: Models.CourseClassListVisibility.public,
						[Models.CourseClassListAttributes.deletedAt]: getNotDeletedCondition().deletedAt,
					},
					include: [
						{
							model: Models.CourseEdition,
							as: Models.CourseClassListRelations.courseEdition,
							attributes: [],
							where: {
								[Models.CourseEditionAttributes.visibility]: Models.CourseEditionVisibility.public,
								[Models.CourseEditionAttributes.deletedAt]: getNotDeletedCondition().deletedAt,
							},
							include: [
								{
									model: Models.Course,
									as: Models.CourseEditionRelations.course,
									attributes: [],
									where: {
										[Models.CourseAttributes.visibility]: Models.CourseVisibility.public,
										[Models.CourseAttributes.deletedAt]: getNotDeletedCondition().deletedAt,
									},
								},
							],
						},
					],
				},
			],
		}),
});

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
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.CourseClass | null>>({
	getCacheKey: options =>
		[!!options.includeDeleted, options.includeDisabled, options.id, options.courseClassListId, options.number].join(
			"."
		),
	calculate: async (config, options) => {
		const where: WhereOptions = {};

		if (!options.includeDeleted) where[Models.CourseClassAttributes.deletedAt] = getNotDeletedCondition().deletedAt;
		else config.ignore();

		if (!options.includeDisabled) where[Models.CourseClassAttributes.disabled] = { [Op.or]: [null, false] };

		return Models.CourseClass.findOne({
			where,
			include: [
				{
					model: Models.CourseClassList,
					as: Models.CourseClassRelations.courseClassList,
					attributes: [],
					include: [
						{
							model: Models.CourseEdition,
							as: Models.CourseClassListRelations.courseEdition,
							attributes: [],
							where: {
								[Models.CourseEditionAttributes.visibility]: Models.CourseEditionVisibility.public,
								[Models.CourseEditionAttributes.deletedAt]: getNotDeletedCondition().deletedAt,
							},
							include: [
								{
									model: Models.Course,
									as: Models.CourseEditionRelations.course,
									attributes: [],
									where: {
										[Models.CourseAttributes.visibility]: Models.CourseVisibility.public,
										[Models.CourseAttributes.deletedAt]: getNotDeletedCondition().deletedAt,
									},
								},
							],
						},
					],
				},
			],
		});
	},
});

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.CourseClass> => {
	const courseClass = await findOne(options);
	if (!courseClass) throw new Errors.ObjectNotFoundError("La clase no existe");

	return courseClass;
};
