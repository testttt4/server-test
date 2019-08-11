import * as Errors from "../errors";

import { Nullable } from "../typings/helperTypes";
import { validateString } from "./Base";

export const validateTitle = (title: string): [true, string] | [false, Errors.BadUserInput[]] => {
	title = title.trim();
	const errors = validateString({ value: title, max: 500, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, title];
};

export const validateContent = (content: string): [true, string] | [false, Errors.BadUserInput[]] => {
	content = content.trim();
	const errors = validateString({ value: content, max: 2000, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, content];
};

export type CreateData = {
	title: string;
	content: string;
	isHTML: boolean;
};
export type ValidatedCreateData = CreateData;
export type InvalidatedCreateData = Partial<Record<keyof CreateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateCreateData = (data: CreateData): [true, ValidatedCreateData] | [false, InvalidatedCreateData] => {
	const validatedData: ValidatedCreateData = {
		...data,
	};
	const errors: InvalidatedCreateData = {};

	const titleValidation = validateTitle(data.title);
	if (titleValidation[0]) validatedData.title = titleValidation[1];
	else errors.title = titleValidation[1];

	const contentValidation = validateContent(data.content);
	if (contentValidation[0]) validatedData.content = contentValidation[1];
	else errors.content = contentValidation[1];

	return Object.keys(errors).length > 0 ? [false, errors] : [true, validatedData];
};

export type UpdateData = {
	title?: Nullable<string>;
	content?: Nullable<string>;
	isHTML?: Nullable<boolean>;
};
export type ValidatedUpdateData = {
	title?: string;
	content?: string;
	isHTML?: boolean;
};
export type InvalidatedUpdateData = Partial<Record<keyof UpdateData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateUpdateData = (data: UpdateData): [true, ValidatedUpdateData] | [false, InvalidatedUpdateData] => {
	const errors: InvalidatedUpdateData = {};

	let title: string | undefined;
	if (data.title) {
		const titleValidation = validateTitle(data.title);
		if (titleValidation[0]) title = titleValidation[1];
		else errors.title = titleValidation[1];
	}

	let content: string | undefined;
	if (data.content) {
		const contentValidation = validateContent(data.content);
		if (contentValidation[0]) content = contentValidation[1];
		else errors.content = contentValidation[1];
	}

	const isHTML = typeof data.isHTML === "boolean" ? data.isHTML : undefined;

	return Object.keys(errors).length > 0
		? [false, errors]
		: [
				true,
				{
					title,
					content,
					isHTML,
				},
		  ];
};
