import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: name, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, name];
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

export type DataToValidate = Required<
	Pick<
		Models.CourseEdition,
		keyof Pick<typeof Models.CourseEditionAttributes, "name" | "semester" | "year" | "visibility">
	>
>;
export type InvalidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Partial<
	Record<TKeys, Errors.BadUserInput[]>
>;
export type ValidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Pick<DataToValidate, TKeys>;
export const validateData = async <TKeys extends keyof DataToValidate>(
	data: Pick<DataToValidate, TKeys>
): Promise<[true, ValidatedData<TKeys>] | [false, InvalidatedData<TKeys>]> => {
	const validatedData: ValidatedData = {} as any;
	const errors: InvalidatedData = {} as any;

	const getDataProperty = <TKey extends keyof DataToValidate>(key: TKey): DataToValidate[TKey] | undefined =>
		(data as DataToValidate)[key] || undefined;

	const validators: Record<keyof DataToValidate, () => Promise<void> | void> = {
		name: async () => {
			const name = getDataProperty("name");

			if (name === undefined) return;

			const nameValidation = await validateName(name);

			if (nameValidation[0]) validatedData.name = nameValidation[1];
			else errors.name = nameValidation[1];
		},
		visibility: () => {
			const visibility = getDataProperty("visibility");

			if (visibility === undefined) return;

			validatedData.visibility = visibility;
		},
		semester: async () => {
			const semester = getDataProperty("semester");

			if (semester === undefined) return;

			const semesterValidation = await validateSemester(semester);

			if (semesterValidation[0]) validatedData.semester = semesterValidation[1];
			else errors.semester = semesterValidation[1];
		},
		year: async () => {
			const year = getDataProperty("year");

			if (year === undefined) return;

			const yearValidation = await validateYear(year);

			if (yearValidation[0]) validatedData.year = yearValidation[1];
			else errors.year = yearValidation[1];
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
