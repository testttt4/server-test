import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateString } from "./Base";

export const validateName = (name: string): [true, string] | [false, Errors.BadUserInput[]] => {
	name = name.trim();
	const errors = validateString({ value: name, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, name];
};

export const validateUrl = (url: string): [true, string] | [false, Errors.BadUserInput[]] => {
	url = url.trim();
	const errors = validateString({ value: url, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, url];
};

export type DataToValidate = Required<
	Pick<Models.VideoFormat, keyof Pick<typeof Models.VideoFormatAttributes, "videoQualityId" | "name" | "url">>
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
		videoQualityId: () => {
			const videoQualityId = getDataProperty("videoQualityId");

			if (videoQualityId === undefined) return;

			const courseClass = Data.VideoQuality.findOne({ id: videoQualityId });

			if (!courseClass)
				errors.videoQualityId = [
					{
						code: "INVALID_VALUE",
						message: `No se encontró la clase con id ${videoQualityId}`,
					},
				];
			else validatedData.videoQualityId = videoQualityId;
		},
		name: async () => {
			const name = getDataProperty("name");

			if (name === undefined) return;

			const nameValidation = await validateName(name);

			if (nameValidation[0]) validatedData.name = nameValidation[1];
			else errors.name = nameValidation[1];
		},
		url: async () => {
			const url = getDataProperty("url");

			if (url === undefined) return;

			const urlValidation = await validateUrl(url);

			if (urlValidation[0]) validatedData.url = urlValidation[1];
			else errors.url = urlValidation[1];
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
