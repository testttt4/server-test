import * as CourseClass from "./CourseClass";
import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import moment from "moment";

export type CreateOptions = {
	data: Validators.CourseClassList.CreateData;
	userId: number;
};
export const create = async ({
	data,
	userId,
}: CreateOptions): Promise<
	[true, Models.CourseClassList] | [false, Validators.CourseClassList.InvalidatedCreateData]
> => {
	const validation = await Validators.CourseClassList.validateCreateData({ data });
	if (!validation[0]) return validation;

	const validatedData = validation[1];

	const courseClassList = await Models.CourseClassList.create({
		...validatedData,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return [true, courseClassList];
};

export type UpdateOptions = {
	id: number;
	data: Validators.CourseClassList.UpdateData;
	userId: number;
};
export const update = async ({
	id,
	data,
	userId,
}: UpdateOptions): Promise<
	[true, Models.CourseClassList] | [false, Validators.CourseClassList.InvalidatedCreateData]
> => {
	const courseClassList = await Data.CourseClassList.findOneOrThrow({ id });

	const validation = await Validators.CourseClassList.validateUpdateData({ data });
	if (!validation[0]) return validation;

	const validatedData = validation[1];

	await courseClassList.update({
		...validatedData,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return [true, courseClassList];
};

const _deleteCourseClassList = async ({
	courseClassList,
	userId,
}: {
	courseClassList: Models.CourseClassList;
	userId: number;
}) => {
	courseClassList.deletedAt = moment().toISOString();
	courseClassList.deletedBy = userId;

	await CourseClass.deleteAllByCourseClassListId({ courseClassListId: courseClassList.id, userId });
	await courseClassList.save();
};

export type DeleteCourseClassListOptions = {
	id: number;
	userId: number;
};
export const deleteCourseClassList = async (options: DeleteCourseClassListOptions) => {
	const { id, userId } = options;

	const courseClassList = await Data.CourseClassList.findOneOrThrow({
		id,
	});

	await _deleteCourseClassList({ courseClassList, userId });
};

export type DeleteAllByCourseIdOptions = {
	courseId: number;
	userId: number;
};
export const deleteAllByCourseId = async ({ courseId, userId }: DeleteAllByCourseIdOptions) => {
	const courseClassLists = await Data.CourseClassList.findAll({ courseId });

	if (!courseClassLists) return;

	await Promise.all(courseClassLists.map(courseClassList => _deleteCourseClassList({ courseClassList, userId })));

	Data.Base.reloadCache();
};
