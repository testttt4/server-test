import * as Data from "../data";
import * as Errors from "../errors";

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

export const validateCourseClassId = async (
	courseClassId: number
): Promise<[true, number] | [false, Errors.BadUserInput[]]> => {
	const courseClass = await Data.CourseClass.findOne({
		id: courseClassId,
		includeDisabled: true,
	});

	const errors: Errors.BadUserInput[] = [];
	if (!courseClass)
		errors.push({ code: "INVALID_VALUE", message: `No se encontró una clase con el id ${courseClassId}` });

	return errors.length > 0 ? [false, errors] : [true, courseClassId];
};

export type CreateData = {
	name: string;
	position: number;
	courseClassId: number;
};
export type ValidatedCreateData = {
	name: string;
	position: number;
	courseClassId: number;
};
export type InvalidatedCreateData = {
	name?: Errors.BadUserInput | Errors.BadUserInput[];
	position?: Errors.BadUserInput | Errors.BadUserInput[];
	courseClassId?: Errors.BadUserInput | Errors.BadUserInput[];
};
export const validateData = async (
	data: CreateData
): Promise<[true, ValidatedCreateData] | [false, InvalidatedCreateData]> => {
	const errors: InvalidatedCreateData = {};

	let name = "";
	const nameValidation = await validateName(data.name);
	if (nameValidation[0]) name = nameValidation[1];
	else errors.name = nameValidation[1];

	let position = 0;
	const positionValidation = await validatePosition(data.position);
	if (positionValidation[0]) position = positionValidation[1];
	else errors.position = positionValidation[1];

	let courseClassId = 0;
	const courseClassIdValidation = await validateCourseClassId(data.courseClassId);
	if (courseClassIdValidation[0]) courseClassId = courseClassIdValidation[1];
	else errors.courseClassId = courseClassIdValidation[1];

	if (Object.keys(errors).length > 0) return [false, errors];

	return [
		true,
		{
			name,
			position,
			courseClassId,
		},
	];
};
