import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

import { FileUpload } from "graphql-upload";
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

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: name, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export const validateEva = (eva: string): [true, string] | [false, Errors.BadUserInput[]] => {
	eva = eva.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: eva, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, eva];
};

export const validateSemester = (semester: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors: Errors.BadUserInput[] = [];

	if (semester !== 1 && semester !== 2)
		errors.push({
			code: "INVALID_VALUE",
			message: "El campo semestre solo puede tomar los valores 1 y 2.",
		});

	return errors.length > 0 ? [false, errors] : [true, semester];
};

export const validateYear = (year: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors: Errors.BadUserInput[] = validateNumber({ value: year, max: 2050, min: 2005 });

	return errors.length > 0 ? [false, errors] : [true, year];
};

export const validateIconURL = (iconURL: string): [true, string | null] | [false, Errors.BadUserInput[]] => {
	let result: string | null = iconURL.trim();
	const errors: Errors.BadUserInput[] = [];

	if (iconURL.length === 0) result = null;

	if (iconURL.length > 255)
		errors.push({
			code: "MAX_LENGTH",
			message: "Hubo un error al intentar guardar la url del ícono del curso.",
		});

	return errors.length > 0 ? [false, errors] : [true, result];
};

export type DataToValidate = Required<
	Pick<Models.Course, keyof Pick<typeof Models.CourseAttributes, "code" | "name" | "eva" | "visibility">>
> & {
	icon: FileUpload;
};
export type InvalidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Partial<
	Record<TKeys, Errors.BadUserInput[]>
>;
export type ValidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Omit<
	Pick<DataToValidate, TKeys>,
	"icon"
> &
	("icon" extends TKeys
		? {
				icon: {
					iconUrl: string;
					unlink: () => void;
				};
		  }
		: { icon?: undefined });
export const validateData = async <TKeys extends keyof DataToValidate>(
	data: Pick<DataToValidate, TKeys>
): Promise<[true, ValidatedData<TKeys>] | [false, InvalidatedData<TKeys>]> => {
	const validatedData: ValidatedData = {} as any;
	const errors: InvalidatedData = {} as any;

	const getDataProperty = <TKey extends keyof DataToValidate>(key: TKey): DataToValidate[TKey] | undefined =>
		(data as DataToValidate)[key] || undefined;

	let unlinkCustomIcon: (() => void) | undefined;
	const validators: Record<keyof DataToValidate, () => Promise<void> | void> = {
		code: async () => {
			const code = getDataProperty("code");

			if (code === undefined) return;

			const codeValidation = await validateCode(code);

			if (codeValidation[0]) validatedData.code = codeValidation[1];
			else errors.code = codeValidation[1];
		},
		name: async () => {
			const name = getDataProperty("name");

			if (name === undefined) return;

			const nameValidation = await validateName(name);

			if (nameValidation[0]) validatedData.name = nameValidation[1];
			else errors.name = nameValidation[1];
		},
		eva: async () => {
			const eva = getDataProperty("eva");

			if (eva === undefined) return;

			if (eva === null) {
				validatedData.eva = null;
				return;
			}

			const evaValidation = await validateEva(eva);

			if (evaValidation[0]) validatedData.eva = evaValidation[1];
			else errors.eva = evaValidation[1];
		},
		visibility: () => {
			const visibility = getDataProperty("visibility");

			if (visibility === undefined) return;

			validatedData.visibility = visibility;
		},
		icon: async () => {
			const icon = getDataProperty("icon");

			if (icon === undefined) return;

			const saveFileOutput = await saveFile(icon, ({ uuid, extension }) =>
				path.join(serverConfig.COURSE_ICONS_PATH, `${uuid}.${extension}`)
			);
			unlinkCustomIcon = saveFileOutput.unlink;
			const iconURLValidation = await validateIconURL(saveFileOutput.url);

			if (iconURLValidation[0])
				validatedData.icon = {
					iconUrl: saveFileOutput.url,
					unlink: saveFileOutput.unlink,
				};
			else errors.icon = iconURLValidation[1];
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	if (hasErrors && unlinkCustomIcon) unlinkCustomIcon();

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
