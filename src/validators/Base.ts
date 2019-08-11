import * as Errors from "../errors";

export type ValidateStringLongerThanOptions = {
	value: string;
	min: number;
};
export const validateStringIsLongerThan = (options: ValidateStringLongerThanOptions): Errors.BadUserInput | null => {
	const { value, min } = options;

	if (value.length < min)
		return {
			code: "MIN_LENGTH",
		};

	return null;
};

export type ValidateStringNotEmptyOptions = {
	value: string;
};
export const validateStringNotEmpty = (options: ValidateStringNotEmptyOptions): Errors.BadUserInput | null => {
	const { value } = options;

	const validation = validateStringIsLongerThan({ value, min: 0 });

	return validation ? { code: "EMPTY_FIELD" } : null;
};

export type ValidateStringShorterThanOptions = {
	value: string;
	max: number;
};
export const validateStringShorterThan = (options: ValidateStringShorterThanOptions): Errors.BadUserInput | null => {
	const { value, max } = options;

	if (value.length > max)
		return {
			code: "MAX_LENGTH",
		};

	return null;
};

export type ValidateStringOptions = {
	value: string;
	max?: number;
	min?: number;
	notEmpty?: boolean;
};
export const validateString = (options: ValidateStringOptions): Errors.BadUserInput[] => {
	const { value, min, max, notEmpty } = options;
	const errors: Errors.BadUserInput[] = [];

	if (notEmpty) {
		const emptyValidation = validateStringNotEmpty({ value });

		if (!emptyValidation) {
			if (min !== undefined) {
				const minValidation = validateStringIsLongerThan({ value, min });

				if (minValidation) errors.push(minValidation);
			}
		} else errors.push(emptyValidation);
	}

	if (max !== undefined) {
		const maxValidation = validateStringShorterThan({ value, max });

		if (maxValidation) errors.push(maxValidation);
	}

	return errors;
};

export type NumberGreaterThanOptions = {
	value: number;
	min: number;
};
export const validateNumberGreaterThan = (options: NumberGreaterThanOptions): Errors.BadUserInput | null => {
	const { value, min } = options;

	if (value < min)
		return {
			code: "MIN_LENGTH",
		};

	return null;
};

export type NumberLessThanOptions = {
	value: number;
	max: number;
};
export const validateNumberLessThan = ({ value, max }: NumberLessThanOptions): Errors.BadUserInput | null => {
	if (value > max)
		return {
			code: "MAX_LENGTH",
		};

	return null;
};

export type NumberOptions = {
	value: number;
	max?: number;
	min?: number;
};
export const validateNumber = ({ value, max, min }: NumberOptions): Errors.BadUserInput[] => {
	const errors: Errors.BadUserInput[] = [];

	if (min !== undefined) {
		const minValidation = validateNumberGreaterThan({ value, min });

		if (minValidation) errors.push(minValidation);
	}

	if (max !== undefined) {
		const maxValidation = validateNumberLessThan({ value, max });

		if (maxValidation) errors.push(maxValidation);
	}

	return errors;
};
