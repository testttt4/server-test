import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();
	const errors: Errors.BadUserInput[] = validateString({ value: name, min: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export const validatePosition = (position: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors: Errors.BadUserInput[] = validateNumber({ value: position, min: 0, max: 1000 });

	return errors.length > 0 ? [false, errors] : [true, position];
};

export type DataToValidate = Required<
	Pick<Models.Video, keyof Pick<typeof Models.VideoAttributes, "courseClassId" | "name" | "position">>
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
		courseClassId: () => {
			const courseClassId = getDataProperty("courseClassId");

			if (courseClassId === undefined) return;

			const courseClass = Data.CourseClass.findOne({ id: courseClassId, includeDisabled: true });

			if (!courseClass)
				errors.courseClassId = [
					{
						code: "INVALID_VALUE",
						message: `No se encontró la clase con id ${courseClassId}`,
					},
				];
			else validatedData.courseClassId = courseClassId;
		},
		name: async () => {
			const name = getDataProperty("name");

			if (name === undefined) return;

			const nameValidation = await validateName(name);

			if (nameValidation[0]) validatedData.name = nameValidation[1];
			else errors.name = nameValidation[1];
		},
		position: async () => {
			const position = getDataProperty("position");

			if (position === undefined) return;

			const positionValidation = await validatePosition(position);

			if (positionValidation[0]) validatedData.position = positionValidation[1];
			else errors.position = positionValidation[1];
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
