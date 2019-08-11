import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as VideoQuality from "./VideoQuality";

import moment from "moment";

export type CreateFromValidatedDataOptions = {
	data: Validators.Video.ValidatedCreateData;
	userId: number;
};
export const createFromValidatedData = async ({
	data,
	userId,
}: CreateFromValidatedDataOptions): Promise<Models.Video> => {
	const video = await Models.Video.create({
		...data,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return video;
};

export type CreateOptions = {
	data: Validators.Video.CreateData;
	userId: number;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.Video] | [false, Validators.Video.InvalidatedCreateData]> => {
	const validation = await Validators.Video.validateData(options.data);
	if (!validation[0]) return validation;

	const video = await createFromValidatedData({ ...options, data: validation[1] });

	Data.Base.reloadCache();

	return [true, video];
};

const _deleteVideo = async ({ video, userId }: { video: Models.Video; userId: number }) => {
	video.deletedAt = moment().toISOString();
	video.deletedBy = userId;

	await VideoQuality.deleteAllVideoQualitiesByVideoId({ videoId: video.id, userId });

	await video.save();
};

export type DeleteVideoOptions = {
	id: number;
	userId: number;
};
export const deleteVideo = async ({ id, userId }: DeleteVideoOptions): Promise<void> => {
	const video = await Data.Video.findOneOrThrow({ id });

	await _deleteVideo({ video, userId });

	Data.Base.reloadCache();
};

export type DeleteAllVideosByCourseClassId = {
	courseClassId: number;
	userId: number;
};
export const deleteAllVideosByCourseClassId = async ({ courseClassId, userId }: DeleteAllVideosByCourseClassId) => {
	const videos = await Data.Video.findAll({ courseClassId });

	await Promise.all(videos.map(video => _deleteVideo({ video, userId })));

	Data.Base.reloadCache();
};
