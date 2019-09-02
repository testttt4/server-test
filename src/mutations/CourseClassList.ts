import * as CourseClass from "./CourseClass";
import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateOptions = {
	data: Validators.CourseClassList.DataToValidate;
	userId: number;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.CourseClassList] | [false, Validators.CourseClassList.InvalidatedData]> => {
	const { data } = options;
	const validation = await Validators.CourseClassList.validateData(data);

	if (!validation[0]) return validation;

	const validatedData = validation[1];

	const courseClassList = await Models.CourseClassList.create(
		identity<Required<Pick<Models.CourseClassList, keyof Omit<typeof Models.CourseClassListAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...validatedData,
		})
	);

	Data.Base.Cache.removeCache();

	return [true, courseClassList];
};

export type UpdateOptions<TKeys extends keyof Validators.CourseClassList.DataToValidate> = {
	id: number;
	data: Pick<Validators.CourseClassList.DataToValidate, TKeys>;
	userId: number;
};
export const update = async <TDataKeys extends keyof Validators.CourseClassList.DataToValidate>({
	id,
	data,
	userId,
}: UpdateOptions<TDataKeys>): Promise<
	[true, Models.CourseClassList] | [false, Validators.CourseClassList.InvalidatedData]
> => {
	const courseClassList = await Data.CourseClassList.findOneOrThrow({ id });

	const validation = await Validators.CourseClassList.validateData(data);
	if (!validation[0]) return validation;

	const validatedData = validation[1];

	const updateData: Partial<Pick<Models.CourseClassList, keyof typeof Models.CourseClassListAttributes>> = {
		updatedAt: moment().toDate(),
		updatedById: userId,
	};

	await courseClassList.update(
		identity<Partial<Pick<Models.CourseClassList, keyof typeof Models.CourseClassListAttributes>>>({
			...updateData,
			...validatedData,
		})
	);

	Data.Base.Cache.removeCache();

	return [true, courseClassList];
};

const _removeCourseClassList = async ({
	courseClassList,
	userId,
}: {
	courseClassList: Models.CourseClassList;
	userId: number;
}) => {
	courseClassList.deletedAt = moment().toDate();
	courseClassList.deletedById = userId;

	await CourseClass.removeAllByCourseClassListId({ courseClassListId: courseClassList.id, userId });
	await courseClassList.save();
};

export type RemoveCourseClassListOptions = {
	id: number;
	userId: number;
};
export const removeCourseClassList = async (options: RemoveCourseClassListOptions) => {
	const { id, userId } = options;

	const courseClassList = await Data.CourseClassList.findOneOrThrow({
		id,
	});

	await _removeCourseClassList({ courseClassList, userId });
};

export type RemoveAllByCourseEditionIdOptions = {
	courseEditionId: number;
	userId: number;
};
export const removeAllByCourseEditionId = async ({ courseEditionId, userId }: RemoveAllByCourseEditionIdOptions) => {
	const courseClassLists = await Data.CourseClassList.findAll({ courseEditionId });

	await Promise.all(courseClassLists.map(courseClassList => _removeCourseClassList({ courseClassList, userId })));

	Data.Base.Cache.removeCache();
};
