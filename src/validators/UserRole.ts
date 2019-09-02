import * as Errors from "../errors";
import * as Models from "../models";

import { validateString } from "./Base";

export const validateName = (
	name: string
): [true, keyof typeof Models.UserRoleName] | [false, Errors.BadUserInput[]] => {
	const errors = validateString({ value: name, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, name as keyof typeof Models.UserRoleName];
};

export type CreateData = {
	name: keyof typeof Models.UserRoleName;
};
export type ValidatedCreateData = CreateData;
export type InvalidatedCreateData = Partial<Record<keyof CreateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateCreateData = (data: CreateData): [true, ValidatedCreateData] | [false, InvalidatedCreateData] => {
	const validatedData: ValidatedCreateData = {
		...data,
	};
	const errors: InvalidatedCreateData = {};

	const nameValidation = validateName(data.name);
	if (nameValidation[0]) validatedData.name = nameValidation[1];
	else errors.name = nameValidation[1];

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};
