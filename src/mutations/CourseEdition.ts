import * as CourseClassList from "./CourseClassList";
import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateOptions = {
	courseId: number;
	data: Validators.CourseEdition.DataToValidate;
	userId: number;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.CourseEditionTableRow] | [false, Validators.CourseEdition.InvalidatedData]> => {
	const { courseId, data, userId } = options;

	const validation = await Validators.CourseEdition.validateData(data);
	if (!validation[0]) return validation;

	const validatedData = validation[1];

	const courseEdition = await Models.CourseEdition.create(
		identity<Required<Pick<Models.CourseEdition, keyof Omit<typeof Models.CourseEditionAttributes, "id">>>>({
			courseId,
			...validatedData,
			createdAt: moment().toDate(),
			createdById: userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
		})
	);

	Data.Base.Cache.removeCache();

	return [true, courseEdition.toTableRow()];
};

export type UpdateOptions<TKeys extends keyof Validators.CourseEdition.DataToValidate> = {
	id: number;
	data: Pick<Validators.CourseEdition.DataToValidate, TKeys>;
	userId: number;
};
export const update = async <TDataKeys extends keyof Validators.CourseEdition.DataToValidate>(
	options: UpdateOptions<TDataKeys>
): Promise<[true, Models.CourseEdition] | [false, Validators.CourseEdition.InvalidatedData]> => {
	const { id, data, userId } = options;

	const courseEdition = Models.CourseEdition.fromTableRow(await Data.CourseEdition.findOneOrThrow({ id }));
	const validation = await Validators.CourseEdition.validateData(data);

	if (!validation[0]) return validation;

	const validatedData = validation[1];

	const updateData: Pick<Models.CourseEdition, "updatedAt" | "updatedById"> = {
		updatedAt: moment().toDate(),
		updatedById: userId,
	};

	await courseEdition.update(
		identity<Partial<Pick<Models.CourseEdition, keyof typeof Models.CourseEditionAttributes>>>({
			...updateData,
			...validatedData,
		})
	);

	Data.Base.Cache.removeCache();

	return [true, courseEdition];
};

const _removeCourseEdition = async ({
	courseEdition,
	userId,
}: {
	courseEdition: Models.CourseEdition;
	userId: number;
}) => {
	courseEdition.deletedAt = moment().toDate();
	courseEdition.deletedById = userId;

	await CourseClassList.removeAllByCourseEditionId({ courseEditionId: courseEdition.id, userId });
	await courseEdition.save();
};

export type RemoveCourseEditionOptions = {
	id: number;
	userId: number;
};
export const removeCourseEdition = async (options: RemoveCourseEditionOptions) => {
	const { id, userId } = options;

	const courseEdition = Models.CourseEdition.fromTableRow(
		await Data.CourseEdition.findOneOrThrow({
			id,
		})
	);

	await _removeCourseEdition({ courseEdition, userId });
};

export type RemoveAllByCourseIdOptions = {
	courseId: number;
	userId: number;
};
export const removeAllByCourseId = async ({ courseId, userId }: RemoveAllByCourseIdOptions) => {
	const courseEditions = await Data.CourseEdition.findAll({ courseId });

	if (!courseEditions) return;

	await Promise.all(
		courseEditions
			.map(Models.CourseEdition.fromTableRow)
			.map(courseEdition => _removeCourseEdition({ courseEdition, userId }))
	);

	Data.Base.Cache.removeCache();
};
