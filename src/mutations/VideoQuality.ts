import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as VideoFormat from "./VideoFormat";

import moment from "moment";

export type VideoQualityData = {
	height: number;
	width: number;
	formats: Validators.VideoFormat.CreateData[];
};

export type CreateFromValidatedDataOptions = {
	userId: number;
	videoId: number;
	data: Validators.VideoQuality.ValidatedCreateData;
};
export const createFromValidatedData = async (
	options: CreateFromValidatedDataOptions
): Promise<Models.VideoQuality> => {
	const { videoId, data, userId } = options;

	const result = await Models.VideoQuality.create({
		...data,
		videoId,

		createdAt: moment().toDate(),
		createdBy: userId,
	});

	await Promise.all(
		data.formats.map(format =>
			VideoFormat.create({
				videoQualityId: result.id,
				userId,
				data: {
					name: format.name,
					url: format.url,
				},
			})
		)
	);

	Data.Base.reloadCache();

	return result;
};

export type CreateOptions = {
	userId: number;
	videoId: number;
	data: VideoQualityData;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.VideoQuality] | [false, Validators.VideoQuality.InvalidatedData]> => {
	const validation = await Validators.VideoQuality.validateCreateData(options.data);
	if (!validation[0]) return validation;

	const result = await createFromValidatedData({
		...options,
		data: validation[1],
	});

	Data.Base.reloadCache();

	return [true, result];
};

const _deleteVideoQuality = async ({ videoQuality, userId }: { videoQuality: Models.VideoQuality; userId: number }) => {
	videoQuality.deletedAt = moment().toISOString();
	videoQuality.deletedBy = userId;

	await VideoFormat.deleteAllByVideoQualityId({ videoQualityId: videoQuality.id, userId });

	return videoQuality.save();
};

export type DeleteVideoQualityOptions = {
	id: number;
	userId: number;
};
export const deleteVideoQuality = async ({ id, userId }: DeleteVideoQualityOptions) => {
	const videoQuality = await Data.VideoQuality.findOneOrThrow({ id });

	await _deleteVideoQuality({ videoQuality, userId });

	Data.Base.reloadCache();
};

export type DeleteAllVideoQualitiesByVideoId = {
	videoId: number;
	userId: number;
};
export const deleteAllVideoQualitiesByVideoId = async ({ videoId, userId }: DeleteAllVideoQualitiesByVideoId) => {
	const videoQualities = await Data.VideoQuality.findAllByVideoId({ videoId });

	await Promise.all(videoQualities.map(videoQuality => _deleteVideoQuality({ videoQuality, userId })));

	Data.Base.reloadCache();
};
