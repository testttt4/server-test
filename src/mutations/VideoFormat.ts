import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import moment from "moment";

export type CreateVideoFormatOptions = {
	userId: number;
	videoQualityId: number;
	data: Validators.VideoFormat.CreateData;
};

export type CreateVideoFormatFromValidatedDataOptions = {
	userId: number;
	videoQualityId: number;
	data: Validators.VideoFormat.CreateData;
};

export type DeleteVideoFormatOptions = {
	id: number;
	userId: number;
};

export type DeleteAllByVideoQualityIdOptions = {
	videoQualityId: number;
	userId: number;
};

export const createFromValidatedData = async ({
	data,
	userId,
	videoQualityId,
}: CreateVideoFormatFromValidatedDataOptions): Promise<Models.VideoFormat> => {
	const videoFormat = await Models.VideoFormat.create({
		...data,
		videoQualityId,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return videoFormat;
};

export const create = async (
	options: CreateVideoFormatOptions
): Promise<[true, Models.VideoFormat] | [false, Validators.VideoFormat.InvalidatedCreateData]> => {
	const validation = await Validators.VideoFormat.validateData(options.data);
	if (!validation[0]) return validation;

	return [true, await createFromValidatedData({ ...options, data: validation[1] })];
};

const _deleteVideoFormat = async ({ videoFormat, userId }: { videoFormat: Models.VideoFormat; userId: number }) => {
	videoFormat.deletedAt = moment().toISOString();
	videoFormat.deletedBy = userId;

	return videoFormat.save();
};

export const deleteVideoFormat = async ({ id, userId }: DeleteVideoFormatOptions) => {
	const videoFormat = await Data.VideoFormat.findOneOrThrow({ id });

	await _deleteVideoFormat({ videoFormat, userId });

	Data.Base.reloadCache();
};

export const deleteAllByVideoQualityId = async ({ videoQualityId, userId }: DeleteAllByVideoQualityIdOptions) => {
	const videoFormats = await Data.VideoFormat.findAllByVideoQuality({
		videoQualityId,
	});

	await Promise.all(videoFormats.map(videoFormat => _deleteVideoFormat({ videoFormat, userId })));

	Data.Base.reloadCache();
};
