import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

import { FileUpload } from "graphql-upload";
import { Nullable } from "../typings/helperTypes";
import path from "path";
import { saveFile } from "../utils/Helper";
import { serverConfig } from "../serverConfig";

export const validateCode = async (code: string): Promise<[true, string] | [false, Errors.BadUserInput[]]> => {
	code = code.trim();
	const errors = validateString({ value: code, notEmpty: true, max: 255 });

	const courseWithSameCode = await Data.Course.findOne({ code, includeDisabled: true });

	if (courseWithSameCode !== undefined) errors.push({ code: "ALREADY_IN_USE" });

	return errors.length > 0 ? [false, errors] : [true, code];
};

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput] => {
	name = name.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: name, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors[0]] : [true, name];
};

export const validateEva = (eva: string): [true, string] | [false, Errors.BadUserInput] => {
	eva = eva.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: eva, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors[0]] : [true, eva];
};

export const validateSemester = (semester: number): [true, number] | [false, Errors.BadUserInput] => {
	const errors: Errors.BadUserInput[] = [];

	if (semester !== 1 && semester !== 2)
		errors.push({
			code: "INVALID_VALUE",
			message: "El campo semestre solo puede tomar los valores 1 y 2.",
		});

	return errors.length > 0 ? [false, errors[0]] : [true, semester];
};

export const validateYear = (year: number): [true, number] | [false, Errors.BadUserInput] => {
	const errors: Errors.BadUserInput[] = validateNumber({ value: year, max: 2050, min: 2005 });

	return errors.length > 0 ? [false, errors[0]] : [true, year];
};

export const validateIconURL = (iconURL: string): [true, string | null] | [false, Errors.BadUserInput] => {
	let result: string | null = iconURL.trim();
	const errors: Errors.BadUserInput[] = [];

	if (iconURL.length === 0) result = null;

	if (iconURL.length > 255)
		errors.push({
			code: "MAX_LENGTH",
			message: "Hubo un error al intentar guardar la url del ícono del curso.",
		});

	return errors.length > 0 ? [false, errors[0]] : [true, result];
};

export type CreateData = {
	code: string;
	name: string;
	status?: Nullable<Models.CourseStatus>;
	eva?: Nullable<string>;
	semester: number;
	year: number;
	icon?: FileUpload | null;
};
export type ValidateCreateDataOptions = {
	data: CreateData;
};
export type ValidatedCreateData = Omit<CreateData, "icon"> & {
	iconUrl: string;
};
export type InvalidatedCreateData = Partial<Record<keyof CreateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateCreateData = async ({
	data,
}: ValidateCreateDataOptions): Promise<[true, ValidatedCreateData] | [false, InvalidatedCreateData]> => {
	const errors: InvalidatedCreateData = {};

	let code = "";
	const codeValidation = await validateCode(data.code);
	if (codeValidation[0]) code = codeValidation[1];
	else errors.code = codeValidation[1];

	let name = "";
	const nameValidation = await validateName(data.name);
	if (nameValidation[0]) name = nameValidation[1];
	else errors.name = nameValidation[1];

	let eva: string | null = null;
	if (typeof data.eva === "string") {
		const evaValidation = await validateEva(data.eva);
		if (evaValidation[0]) eva = evaValidation[1];
		else errors.eva = evaValidation[1];
	} else eva = null;

	let semester = 0;
	const semesterValidation = await validateSemester(data.semester);
	if (semesterValidation[0]) semester = semesterValidation[1];
	else errors.semester = semesterValidation[1];

	let year = 0;
	const yearValidation = await validateYear(data.year);
	if (yearValidation[0]) year = yearValidation[1];
	else errors.year = yearValidation[1];

	let iconUrl: string = serverConfig.DEFAULT_COURSE_ICON_URL;
	let unlinkCustomIcon: (() => void) | undefined;
	if (data.icon) {
		const { icon } = data;

		const saveFileOutput = await saveFile(icon, ({ uuid, extension }) =>
			path.join(serverConfig.COURSE_ICONS_PATH, `${uuid}.${extension}`)
		);
		unlinkCustomIcon = saveFileOutput.unlink;
		const iconURLValidation = await validateIconURL(saveFileOutput.url);

		if (iconURLValidation[0]) iconUrl = saveFileOutput.url;
		else errors.icon = iconURLValidation[1];
	}

	const errorsFound = Object.keys(errors).length > 0;

	if (errorsFound && unlinkCustomIcon) unlinkCustomIcon();

	return errorsFound
		? [false, errors]
		: [
				true,
				{
					status: data.status,
					code,
					name,
					eva,
					semester,
					year,
					iconUrl,
				},
		  ];
};

export type UpdateData = {
	code?: Nullable<string>;
	name?: Nullable<string>;
	disabled?: Nullable<boolean>;
	eva?: Nullable<string>;
	semester?: Nullable<number>;
	year?: Nullable<number>;
	icon?: FileUpload | null;
};
export type ValidateUpdateOptions = {
	course: Models.Course;
	data: UpdateData;
};
export type ValidatedUpdateData = {
	code?: string;
	name?: string;
	disabled: boolean;
	eva?: Nullable<string>;
	semester?: number;
	year?: number;
	iconUrl?: Nullable<string>;
};
export type InvalidatedUpdateData = Partial<Record<keyof CreateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateUpdateData = async ({
	data,
	course,
}: ValidateUpdateOptions): Promise<[true, ValidatedUpdateData] | [false, InvalidatedUpdateData]> => {
	const validatedData: ValidatedUpdateData = { disabled: data.disabled === true };
	const errors: InvalidatedCreateData = {};

	if (typeof data.code === "string" && data.code !== course.code) {
		const codeValidation = await validateCode(data.code);

		if (codeValidation[0]) validatedData.code = codeValidation[1];
		else errors.code = codeValidation[1];
	}

	if (typeof data.name === "string" && data.name !== course.name) {
		const nameValidation = await validateName(data.name);

		if (nameValidation[0]) validatedData.name = nameValidation[1];
		else errors.name = nameValidation[1];
	}

	if (typeof data.eva === "string" && data.eva !== course.eva) {
		const evaValidation = await validateEva(data.eva);

		if (evaValidation[0]) validatedData.eva = evaValidation[1];
		else errors.eva = evaValidation[1];
	} else if (data.eva === null) validatedData.eva = null;

	if (typeof data.semester === "number" && data.semester !== course.semester) {
		const semesterValidation = await validateSemester(data.semester);

		if (semesterValidation[0]) validatedData.semester = semesterValidation[1];
		else errors.semester = semesterValidation[1];
	}

	if (typeof data.year === "number" && data.year !== course.year) {
		const yearValidation = await validateYear(data.year);

		if (yearValidation[0]) validatedData.year = yearValidation[1];
		else errors.year = yearValidation[1];
	}

	let unlinkCustomIcon: (() => void) | undefined;
	if (data.icon) {
		const { icon } = data;

		const saveFileOutput = await saveFile(icon, ({ uuid, extension }) =>
			path.join(serverConfig.COURSE_ICONS_PATH, `${uuid}.${extension}`)
		);
		unlinkCustomIcon = saveFileOutput.unlink;
		const iconURLValidation = await validateIconURL(saveFileOutput.url);

		if (iconURLValidation[0]) validatedData.iconUrl = saveFileOutput.url;
		else errors.icon = iconURLValidation[1];
	} else if (typeof data.icon === "undefined") validatedData.iconUrl = serverConfig.DEFAULT_COURSE_ICON_URL;
	else if (data.icon === null) validatedData.iconUrl = null;

	const errorsFound = Object.keys(errors).length > 0;

	if (errorsFound && unlinkCustomIcon) unlinkCustomIcon();

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};
