import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber } from "./Base";

export const validateHeight = (height: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors = validateNumber({ value: height, min: 0, max: 30000 });

	return errors.length > 0 ? [false, errors] : [true, height];
};

export const validateWidth = (width: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors = validateNumber({ value: width, min: 0, max: 30000 });

	return errors.length > 0 ? [false, errors] : [true, width];
};

export type DataToValidate = Required<
	Pick<Models.VideoQuality, keyof Pick<typeof Models.VideoQualityAttributes, "width" | "height" | "videoId">>
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
		videoId: () => {
			const videoId = getDataProperty("videoId");

			if (videoId === undefined) return;

			const courseClass = Data.Video.findOne({ id: videoId });

			if (!courseClass)
				errors.videoId = [
					{
						code: "INVALID_VALUE",
						message: `No se encontró el video con id ${videoId}`,
					},
				];
			else validatedData.videoId = videoId;
		},
		height: async () => {
			const height = getDataProperty("height");

			if (height === undefined) return;

			const heightValidation = await validateHeight(height);

			if (heightValidation[0]) validatedData.height = heightValidation[1];
			else errors.height = heightValidation[1];
		},
		width: async () => {
			const width = getDataProperty("width");

			if (width === undefined) return;

			const widthValidation = await validateWidth(width);

			if (widthValidation[0]) validatedData.width = widthValidation[1];
			else errors.width = widthValidation[1];
		},
	};

	for (const key of Object.keys(validators) as Array<keyof DataToValidate>) await validators[key]();

	const hasErrors = Object.keys(errors).length > 0;

	return hasErrors ? [false, errors as any] : [true, validatedData as any];
};
