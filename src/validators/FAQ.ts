import * as Errors from "../errors";
import * as Models from "../models";

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

export type DataToValidate = Required<
	Pick<Models.FAQ, keyof Pick<typeof Models.FAQAttributes, "title" | "content" | "isHTML">>
>;
export type InvalidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Partial<
	Record<TKeys, Errors.BadUserInput[]>
>;
export type ValidatedData<TKeys extends keyof DataToValidate = keyof DataToValidate> = Pick<DataToValidate, TKeys>;
export const validateData = async <TKeys extends keyof DataToValidate>(
	data: Pick<DataToValidate, TKeys>
): Promise<[true, ValidatedData<TKeys>] | [false, InvalidatedData<TKeys>]> => {
	const validatedData: ValidatedData<any> = {} as any;
	const errors: InvalidatedData = {} as any;

	const getDataProperty = <TKey extends keyof DataToValidate>(key: TKey): DataToValidate[TKey] | undefined =>
		(data as DataToValidate)[key] || undefined;

	const validators: Record<keyof DataToValidate, () => Promise<void> | void> = {
		title: async () => {
			const title = getDataProperty("title");

			if (title === undefined) return;

			const titleValidation = await validateTitle(title);

			if (titleValidation[0]) validatedData.title = titleValidation[1];
			else errors.title = titleValidation[1];
		},
		content: async () => {
			const content = getDataProperty("content");

			if (content === undefined) return;

			const contentValidation = await validateContent(content);

			if (contentValidation[0]) validatedData.content = contentValidation[1];
			else errors.content = contentValidation[1];
		},
		isHTML: async () => {
			const isHTML = getDataProperty("isHTML");

			if (isHTML === undefined) return;

			validatedData.isHTML = isHTML;
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
