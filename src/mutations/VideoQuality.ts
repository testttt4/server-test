import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as VideoFormat from "./VideoFormat";

import { identity } from "../utils/Helper";
import moment from "moment";

// export type VideoQualityData = {
// 	height: number;
// 	width: number;
// 	formats: Validators.VideoFormat.CreateData[];
// };

export type CreateFromValidatedDataOptions = {
	userId: number;
	videoId: number;
	data: Required<
		Pick<
			Models.VideoQuality,
			keyof Omit<
				typeof Models.VideoQualityAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (
	options: CreateFromValidatedDataOptions
): Promise<Models.VideoQuality> => {
	const { videoId, data } = options;

	const result = await Models.VideoQuality.create(
		identity<Required<Pick<Models.VideoQuality, keyof Omit<typeof Models.VideoQualityAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...data,
			videoId,
		})
	);

	Data.Base.Cache.removeCache();

	return result;
};

export type CreateOptions = {
	userId: number;
	videoId: number;
	data: Validators.VideoQuality.DataToValidate;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.VideoQuality] | [false, Validators.VideoQuality.InvalidatedData]> => {
	const validation = await Validators.VideoQuality.validateData(options.data);

	if (!validation[0]) return validation;

	const result = await createFromValidatedData({
		...options,
		data: validation[1],
	});

	Data.Base.Cache.removeCache();

	return [true, result];
};

const _removeVideoQuality = async ({ videoQuality, userId }: { videoQuality: Models.VideoQuality; userId: number }) => {
	videoQuality.deletedAt = moment().toDate();
	videoQuality.deletedById = userId;

	await VideoFormat.removeAllByVideoQualityId({ videoQualityId: videoQuality.id, userId });

	return videoQuality.save();
};

export type RemoveVideoQualityOptions = {
	id: number;
	userId: number;
};
export const removeVideoQuality = async ({ id, userId }: RemoveVideoQualityOptions) => {
	const videoQuality = await Data.VideoQuality.findOneOrThrow({ id });

	await _removeVideoQuality({ videoQuality, userId });

	Data.Base.Cache.removeCache();
};

export type RemoveAllVideoQualitiesByVideoId = {
	videoId: number;
	userId: number;
};
export const removeAllVideoQualitiesByVideoId = async ({ videoId, userId }: RemoveAllVideoQualitiesByVideoId) => {
	const videoQualities = await Data.VideoQuality.findAllByVideoId({ videoId });

	await Promise.all(videoQualities.map(videoQuality => _removeVideoQuality({ videoQuality, userId })));

	Data.Base.Cache.removeCache();
};
