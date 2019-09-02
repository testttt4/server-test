import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateVideoFormatFromValidatedDataOptions = {
	userId: number;
	videoQualityId: number;
	data: Required<
		Pick<
			Models.VideoFormat,
			keyof Omit<
				typeof Models.VideoFormatAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (
	options: CreateVideoFormatFromValidatedDataOptions
): Promise<Models.VideoFormat> => {
	const { data, videoQualityId } = options;

	const videoFormat = await Models.VideoFormat.create(
		identity<Required<Pick<Models.VideoFormat, keyof Omit<typeof Models.VideoFormatAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...data,
			videoQualityId,
		})
	);

	Data.Base.Cache.removeCache();

	return videoFormat;
};

export type CreateVideoFormatOptions = {
	userId: number;
	videoQualityId: number;
	data: Validators.VideoFormat.DataToValidate;
};
export const create = async (
	options: CreateVideoFormatOptions
): Promise<[true, Models.VideoFormat] | [false, Validators.VideoFormat.InvalidatedData]> => {
	const validation = await Validators.VideoFormat.validateData(options.data);
	if (!validation[0]) return validation;

	return [true, await createFromValidatedData({ ...options, data: validation[1] })];
};

const _removeVideoFormat = async ({ videoFormat, userId }: { videoFormat: Models.VideoFormat; userId: number }) => {
	videoFormat.deletedAt = moment().toDate();
	videoFormat.deletedById = userId;

	return videoFormat.save();
};

export type RemoveVideoFormatOptions = {
	id: number;
	userId: number;
};
export const removeVideoFormat = async ({ id, userId }: RemoveVideoFormatOptions) => {
	const videoFormat = await Data.VideoFormat.findOneOrThrow({ id });

	await _removeVideoFormat({ videoFormat, userId });

	Data.Base.Cache.removeCache();
};

export type RemoveAllByVideoQualityIdOptions = {
	videoQualityId: number;
	userId: number;
};
export const removeAllByVideoQualityId = async ({ videoQualityId, userId }: RemoveAllByVideoQualityIdOptions) => {
	const videoFormats = await Data.VideoFormat.findAllByVideoQuality({
		videoQualityId,
	});

	await Promise.all(videoFormats.map(videoFormat => _removeVideoFormat({ videoFormat, userId })));

	Data.Base.Cache.removeCache();
};
