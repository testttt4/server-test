import * as CourseEdition from "./CourseEdition";
import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as fs from "fs";
import * as path from "path";

import { identity, pick } from "../utils/Helper";

import moment from "moment";
import { serverConfig } from "../serverConfig";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Required<
		Pick<
			Models.Course,
			keyof Omit<
				typeof Models.CourseAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (options: CreateFromValidatedDataOptions): Promise<Models.Course> => {
	const course = new Models.Course(
		identity<Required<Pick<Models.Course, keyof Omit<typeof Models.CourseAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...options.data,
		})
	);

	Data.Base.Cache.removeCache();

	return course;
};

export type CreateOptions = {
	userId: number;
	data: Validators.Course.DataToValidate;
};
export const create = async ({
	data,
	userId,
}: CreateOptions): Promise<[true, Models.Course] | [false, Validators.Course.InvalidatedData]> => {
	const dataValidation = await Validators.Course.validateData(data);

	if (!dataValidation[0]) return dataValidation;

	const [, validatedData] = dataValidation;

	const course = await createFromValidatedData({
		data: {
			...pick(validatedData, ["code", "eva", "name", "visibility"]),
			iconURL: validatedData.icon.iconUrl,
		},
		userId,
	});

	return [true, course];
};

export type UpdateOptions<TKeys extends keyof Validators.Course.DataToValidate> = {
	id: number;
	data: Pick<Validators.Course.DataToValidate, TKeys>;
	userId: number;
};
export const update = async <TDataKeys extends keyof Validators.Course.DataToValidate>({
	id,
	data,
	userId,
}: UpdateOptions<TDataKeys>): Promise<
	[true, Models.Course] | [false, Pick<Validators.Course.InvalidatedData<TDataKeys>, TDataKeys>]
> => {
	const course = await Data.Course.findOneOrThrow({ id, includeDisabled: true });
	const prevIconURL = course.iconURL;
	let prevIconPath: string | undefined;

	if (prevIconURL) {
		const indexOf = prevIconURL.indexOf(serverConfig.COURSE_ICONS_URL);

		if (indexOf !== -1)
			prevIconPath = path.join(serverConfig.COURSE_ICONS_PATH, ...prevIconURL.substr(indexOf).split("/"));
	}

	const dataValidation = await Validators.Course.validateData(data);

	if (!dataValidation[0]) return dataValidation;

	const { icon, ...dataValidationRest } = dataValidation[1];

	const updateData: Partial<Pick<Models.Course, keyof typeof Models.CourseAttributes>> = {
		iconURL: (icon && icon.iconUrl) || undefined,
		updatedAt: moment().toDate(),
		updatedById: userId,
	};

	await course.update(
		identity<Partial<Pick<Models.Course, keyof typeof Models.CourseAttributes>>>({
			...updateData,
			...dataValidationRest,
		})
	);

	if (prevIconPath && prevIconPath !== serverConfig.DEFAULT_COURSE_ICON_FILE_PATH && fs.existsSync(prevIconPath))
		fs.unlinkSync(prevIconPath);

	Data.Base.Cache.removeCache();

	return [true, course];
};

export type RemoveOptions = {
	id: number;
	userId: number;
};
export const remove = async ({ id, userId }: RemoveOptions): Promise<boolean> => {
	const course = await Data.Course.findOneOrThrow({ id, includeDisabled: true });

	course.deletedById = userId;
	course.deletedAt = moment().toDate();

	await CourseEdition.removeAllByCourseId({ userId, courseId: id });
	await course.save();

	Data.Base.Cache.removeCache();

	return true;
};
