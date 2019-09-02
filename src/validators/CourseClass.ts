import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

export const validateTitle = (title: string): [true, string] | [false, Errors.BadUserInput[]] => {
	title = title.trim();
	const errors = validateString({ value: title, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, title];
};

export type ValidateCourseClassNumberOptions = {
	courseClassNumber: number;
	courseClassListId: number | undefined;
};
export const validateCourseClassNumber = async (
	options: ValidateCourseClassNumberOptions
): Promise<[true, number] | [false, Errors.BadUserInput[]]> => {
	const { courseClassNumber, courseClassListId } = options;

	const errors = validateNumber({ value: courseClassNumber, min: 0, max: 10000 });

	if (courseClassListId) {
		const classWithSameNumber = await Data.CourseClass.findOne({
			courseClassListId,
			number: courseClassNumber,
			includeDisabled: true,
		});

		if (classWithSameNumber)
			errors.push({
				code: "INVALID_VALUE",
				message: `Ya existe una clase con número ${courseClassNumber} en la lista.`,
			});
	}

	return errors.length > 0 ? [false, errors] : [true, courseClassNumber];
};

export type DataToValidate = Required<
	Pick<
		Models.CourseClass,
		keyof Pick<typeof Models.CourseClassAttributes, "number" | "title" | "disabled" | "courseClassListId">
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
		number: async () => {
			const number = getDataProperty("number");
			const courseClassListId = getDataProperty("courseClassListId");

			if (number === undefined) return;

			const numberValidation = await validateCourseClassNumber({ courseClassListId, courseClassNumber: number });

			if (numberValidation[0]) validatedData.number = numberValidation[1];
			else errors.number = numberValidation[1];
		},
		title: async () => {
			const title = getDataProperty("title");

			if (title === undefined) return;

			const titleValidation = await validateTitle(title);

			if (titleValidation[0]) validatedData.title = titleValidation[1];
			else errors.title = titleValidation[1];
		},
		disabled: () => {
			const disabled = getDataProperty("disabled");

			if (disabled === undefined) return;

			validatedData.disabled = disabled;
		},
		courseClassListId: async () => {
			const courseClassListId = getDataProperty("courseClassListId");

			if (courseClassListId === undefined) return;

			const courseClassList = await Data.CourseClassList.findOne({
				id: courseClassListId,
				includeDisabled: true,
			});

			if (!courseClassList) {
				errors.courseClassListId = [
					{
						code: "INVALID_VALUE",
						message: `No se encontró una lista de clases con el id ${courseClassListId}`,
					},
				];
			} else validatedData.courseClassListId = courseClassListId;
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
