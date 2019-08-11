import * as Errors from "../errors";

import { validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();
	const errors = validateString({ value: name, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export const validateURL = (url: string): [true, string] | [false, Errors.BadUserInput[]] => {
	url = url.trim();
	const errors = validateString({ value: url, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, url];
};

export type CreateData = {
	name: string;
	url: string;
};
export type ValidatedCreateData = CreateData;
export type InvalidatedCreateData = Partial<Record<keyof CreateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateData = (data: CreateData): [true, ValidatedCreateData] | [false, InvalidatedCreateData] => {
	const validatedData: ValidatedCreateData = {
		...data,
	};
	const errors: InvalidatedCreateData = {};

	const nameValidation = validateName(data.name);
	if (nameValidation[0]) validatedData.name = nameValidation[1];
	else errors.name = nameValidation[1];

	const urlValidation = validateURL(data.url);
	if (urlValidation[0]) validatedData.url = urlValidation[1];
	else errors.url = urlValidation[1];

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};
