import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();

	const errors = validateString({ value: name, min: 1, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export type DataToValidate = Required<
	Pick<
		Models.CourseClassList,
		keyof Pick<typeof Models.CourseClassListAttributes, "name" | "visibility" | "courseEditionId">
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
		courseEditionId: async () => {
			const courseEditionId = getDataProperty("courseEditionId");

			if (courseEditionId === undefined) return;

			const courseEdition = await Data.CourseEdition.findOne({
				id: courseEditionId,
				includeDisabled: true,
			});

			if (!courseEdition)
				errors.courseEditionId = [
					{
						code: "INVALID_VALUE",
						message: `No se encontró una edición del curso con id ${courseEditionId}`,
					},
				];
			else validatedData.courseEditionId = courseEditionId;
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
