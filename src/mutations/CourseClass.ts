import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as Video from "./Video";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Required<
		Pick<
			Models.CourseClass,
			keyof Omit<
				typeof Models.CourseClassAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (
	options: CreateFromValidatedDataOptions
): Promise<Models.CourseClassTableRow> => {
	const courseClass = new Models.CourseClass(
		identity<Required<Pick<Models.CourseClass, keyof Omit<typeof Models.CourseClassAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...options.data,
		})
	);

	await courseClass.save();

	Data.Base.Cache.removeCache();

	return courseClass.toTableRow();
};

export type CreateOptions = {
	userId: number;
	data: Validators.CourseClass.DataToValidate;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.CourseClassTableRow] | [false, Validators.CourseClass.InvalidatedData]> => {
	const validation = await Validators.CourseClass.validateData(options.data);

	if (!validation[0]) return validation;

	const courseClass = await createFromValidatedData({
		...options,
		data: validation[1],
	});

	return [true, courseClass];
};

export type UpdateFromValidatedDataOptions = {
	id: number;
	userId: number;
	data: Partial<
		Pick<
			Models.CourseClass,
			keyof Omit<
				typeof Models.CourseClassAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const updateFromValidatedData = async <TDataKeys extends keyof Validators.CourseClass.DataToValidate>(
	options: UpdateFromValidatedDataOptions
): Promise<Models.CourseClassTableRow> => {
	const { data, userId } = options;

	const courseClass = Models.CourseClass.fromTableRow(
		await Data.CourseClass.findOneOrThrow({ id: options.id, includeDisabled: true })
	);

	const updateData: Partial<Models.CourseTableRow> = {
		updatedAt: moment().toDate(),
		updatedById: userId,
	};

	await courseClass.update(
		identity<Partial<Models.CourseTableRow>>({
			...updateData,
			...data,
		})
	);

	Data.Base.Cache.removeCache();

	return courseClass.toTableRow();
};

export type UpdateOptions<TKeys extends keyof Validators.CourseClass.DataToValidate> = {
	id: number;
	data: Pick<Validators.CourseClass.DataToValidate, TKeys>;
	userId: number;
};
export const update = async <TKeys extends keyof Validators.CourseClass.DataToValidate>(
	options: UpdateOptions<TKeys>
): Promise<[true, Models.CourseClassTableRow] | [false, Validators.CourseClass.InvalidatedData<TKeys>]> => {
	const { id, data, userId } = options;
	const validation = await Validators.CourseClass.validateData(data);

	if (!validation[0]) return validation;

	return [true, await updateFromValidatedData({ id, data: validation[1], userId })];
};

const _removeCourseClass = async ({ courseClass, userId }: { courseClass: Models.CourseClass; userId: number }) => {
	courseClass.deletedAt = moment().toDate();
	courseClass.deletedById = userId;

	await Video.removeAllVideosByCourseClassId({ courseClassId: courseClass.id, userId });

	await courseClass.save();
};

export type RemoveCourseClassOptions = {
	id: number;
	userId: number;
};
export const removeCourseClass = async ({ id, userId }: RemoveCourseClassOptions) => {
	const courseClass = Models.CourseClass.fromTableRow(await Data.CourseClass.findOneOrThrow({ id }));

	await _removeCourseClass({ courseClass, userId });

	Data.Base.Cache.removeCache();
};

export type RemoveAllByCourseClassListIdOptions = {
	courseClassListId: number;
	userId: number;
};
export const removeAllByCourseClassListId = async ({
	courseClassListId,
	userId,
}: RemoveAllByCourseClassListIdOptions) => {
	const courseClasses = await Data.CourseClass.findAll({
		courseClassListId,
	}).then(courseClasses => courseClasses.map(Models.CourseClass.fromTableRow));

	await Promise.all(courseClasses.map(courseClass => _removeCourseClass({ courseClass, userId })));

	Data.Base.Cache.removeCache();
};
