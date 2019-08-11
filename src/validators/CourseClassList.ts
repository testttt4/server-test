import * as Data from "../data";
import * as Errors from "../errors";

import { Nullable } from "../typings/helperTypes";
import { validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();

	const errors = validateString({ value: name, min: 1, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export type CreateData = {
	courseId: number;
	name: string;
	disabled?: Nullable<boolean>;
};
export type ValidateCreateDataOptions = {
	data: CreateData;
};
export type ValidatedCreateData = {
	courseId: number;
	name: string;
	disabled: boolean;
};
export type InvalidatedCreateData = {
	name?: Errors.BadUserInput[];
};
export const validateCreateData = async ({
	data,
}: ValidateCreateDataOptions): Promise<[true, ValidatedCreateData] | [false, InvalidatedCreateData]> => {
	const validatedData: ValidatedCreateData = {
		...data,
		disabled: typeof data.disabled === "boolean" && data.disabled,
	};
	const errors: InvalidatedCreateData = {};

	await Data.Course.findOneOrThrow({ id: data.courseId, includeDisabled: true });

	const nameValidation = validateName(data.name);
	if (nameValidation[0]) validatedData.name = nameValidation[1];
	else errors.name = nameValidation[1];

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};

export type UpdateData = {
	name: string;
	disabled?: Nullable<boolean>;
};
export type ValidateUpdateDataOptions = {
	data: UpdateData;
};
export type ValidatedUpdateData = {
	name: string;
	disabled?: boolean | undefined;
};
export type InvalidatedUpdateData = {
	name?: Errors.BadUserInput[];
};
export const validateUpdateData = ({
	data,
}: ValidateUpdateDataOptions): [true, ValidatedUpdateData] | [false, InvalidatedUpdateData] => {
	const validatedData: ValidatedUpdateData = {
		...data,
		disabled: typeof data.disabled === "boolean" ? data.disabled : undefined,
	};
	const errors: InvalidatedUpdateData = {};

	const nameValidation = validateName(data.name);
	if (nameValidation[0]) validatedData.name = nameValidation[1];
	else errors.name = nameValidation[1];

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};
