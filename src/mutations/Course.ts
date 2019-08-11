import * as CourseClassList from "./CourseClassList";
import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as fs from "fs";
import * as path from "path";

import { FileUpload } from "graphql-upload";
import moment from "moment";
import { serverConfig } from "../serverConfig";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Validators.Course.ValidatedCreateData;
};
export const createFromValidatedData = async (options: CreateFromValidatedDataOptions): Promise<Models.Course> => {
	const course = await Models.Course.create({
		...options.data,
		createdBy: options.userId,
		createdAt: moment().toDate(),
	});

	Data.Base.reloadCache();

	return course;
};

export type CreateOptions = {
	userId: number;
	data: Omit<Validators.Course.CreateData, "iconURL"> & {
		icon?: FileUpload | null;
	};
};
export const create = async ({
	data,
	userId,
}: CreateOptions): Promise<[true, Models.Course] | [false, Validators.Course.InvalidatedCreateData]> => {
	const dataValidation = await Validators.Course.validateCreateData({ data });

	if (!dataValidation[0]) return dataValidation;

	const course = await createFromValidatedData({
		data: {
			...dataValidation[1],
		},
		userId,
	});

	return [true, course];
};

export type UpdateOptions = {
	id: number;
	data: Omit<Validators.Course.UpdateData, "iconURL"> & {
		icon?: FileUpload | null | undefined;
	};
	userId: number;
};
export const update = async ({
	id,
	data,
	userId,
}: UpdateOptions): Promise<[true, Models.Course] | [false, Validators.Course.InvalidatedUpdateData]> => {
	const course = await Data.Course.findOneOrThrow({ id, includeDisabled: true });
	const prevIconURL = course.iconURL;
	let prevIconPath: string | undefined;

	if (prevIconURL) {
		const indexOf = prevIconURL.indexOf(serverConfig.COURSE_ICONS_URL);

		if (indexOf !== -1) prevIconPath = path.join(serverConfig.COURSE_ICONS_PATH, prevIconURL.substr(indexOf));
	}

	const dataValidation = await Validators.Course.validateUpdateData({
		data,
		course,
	});

	if (!dataValidation[0]) return dataValidation;

	await course.update({
		...dataValidation[1],
		updatedAt: moment().toDate(),
		updatedBy: userId,
	});

	if (prevIconPath && prevIconPath !== serverConfig.DEFAULT_COURSE_ICON_FILE_PATH && fs.existsSync(prevIconPath))
		fs.unlinkSync(prevIconPath);

	Data.Base.reloadCache();

	return [true, course];
};

export type DeleteCourseOptions = {
	id: number;
	userId: number;
};
export const deleteCourse = async ({ id, userId }: DeleteCourseOptions): Promise<boolean> => {
	const course = await Data.Course.findOneOrThrow({ id, includeDisabled: true });

	course.deletedBy = userId;
	course.deletedAt = moment().toISOString();

	await CourseClassList.deleteAllByCourseId({ userId, courseId: id });
	await course.save();

	Data.Base.reloadCache();

	return true;
};
