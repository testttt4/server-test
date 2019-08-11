import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as Video from "./Video";

import moment from "moment";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Validators.CourseClass.ValidatedCreateData;
};
export const createFromValidatedData = async ({
	data,
	userId,
}: CreateFromValidatedDataOptions): Promise<Models.CourseClass> => {
	const courseClass = await Models.CourseClass.create({
		...data,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return courseClass;
};

export type CreateOptions = {
	userId: number;
	data: Validators.CourseClass.CreateData;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.CourseClass] | [false, Validators.CourseClass.InvalidatedCreateData]> => {
	const validation = await Validators.CourseClass.validateData({ data: options.data });
	if (!validation[0]) return validation;

	return [
		true,
		await createFromValidatedData({
			...options,
			data: validation[1],
		}),
	];
};

export type UpdateFromValidatedDataOptions = {
	userId: number;
	data: Validators.CourseClass.ValidatedUpdateData;
};
export const updateFromValidatedData = async (options: UpdateFromValidatedDataOptions): Promise<Models.CourseClass> => {
	const { data, userId } = options;

	const courseClass = await Data.CourseClass.findOneOrThrow({ id: data.id, includeDisabled: true });

	await courseClass.update({
		...data,
		updatedAt: moment().toDate(),
		updatedBy: userId,
	});

	Data.Base.reloadCache();

	return courseClass;
};

export type UpdateOptions = {
	userId: number;
	data: Validators.CourseClass.UpdateData;
};
export const update = async ({
	data,
	userId,
}: UpdateOptions): Promise<[true, Models.CourseClass] | [false, Validators.CourseClass.InvalidatedUpdateData]> => {
	const validation = await Validators.CourseClass.validateUpdateData(data);
	if (!validation[0]) return validation;

	return [true, await updateFromValidatedData({ data: validation[1], userId })];
};

const _deleteCourseClass = async ({ courseClass, userId }: { courseClass: Models.CourseClass; userId: number }) => {
	courseClass.deletedAt = moment().toISOString();
	courseClass.deletedBy = userId;

	await Video.deleteAllVideosByCourseClassId({ courseClassId: courseClass.id, userId });

	await courseClass.save();
};

export type DeleteCourseClassOptions = {
	id: number;
	userId: number;
};
export const deleteCourseClass = async ({ id, userId }: DeleteCourseClassOptions) => {
	const courseClass = await Data.CourseClass.findOneOrThrow({ id });

	await _deleteCourseClass({ courseClass, userId });

	Data.Base.reloadCache();
};

export type DeleteAllByCourseClassListIdOptions = {
	courseClassListId: number;
	userId: number;
};
export const deleteAllByCourseClassListId = async ({
	courseClassListId,
	userId,
}: DeleteAllByCourseClassListIdOptions) => {
	const courseClasses = await Data.CourseClass.findAll({
		courseClassListId,
	});

	await Promise.all(courseClasses.map(courseClass => _deleteCourseClass({ courseClass, userId })));

	Data.Base.reloadCache();
};
