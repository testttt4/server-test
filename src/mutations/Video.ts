import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";
import * as VideoQuality from "./VideoQuality";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Required<
		Pick<
			Models.Video,
			keyof Omit<
				typeof Models.VideoAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (options: CreateFromValidatedDataOptions): Promise<Models.Video> => {
	const video = await Models.Video.create(
		identity<Required<Pick<Models.Video, keyof Omit<typeof Models.VideoAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...options.data,
		})
	);

	Data.Base.Cache.removeCache();

	return video;
};

export type CreateOptions = {
	userId: number;
	data: Validators.Video.DataToValidate;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.Video] | [false, Validators.Video.InvalidatedData]> => {
	const validation = await Validators.Video.validateData(options.data);

	if (!validation[0]) return validation;

	const video = await createFromValidatedData({ ...options, data: validation[1] });

	return [true, video];
};

const _removeVideo = async ({ video, userId }: { video: Models.Video; userId: number }) => {
	video.deletedAt = moment().toDate();
	video.deletedById = userId;

	await VideoQuality.removeAllVideoQualitiesByVideoId({ videoId: video.id, userId });

	await video.save();
};

export type RemoveVideoOptions = {
	id: number;
	userId: number;
};
export const removeVideo = async ({ id, userId }: RemoveVideoOptions): Promise<void> => {
	const video = await Data.Video.findOneOrThrow({ id });

	await _removeVideo({ video, userId });

	Data.Base.Cache.removeCache();
};

export type RemoveAllVideosByCourseClassId = {
	courseClassId: number;
	userId: number;
};
export const removeAllVideosByCourseClassId = async ({ courseClassId, userId }: RemoveAllVideosByCourseClassId) => {
	const videos = await Data.Video.findAll({ courseClassId });

	await Promise.all(videos.map(video => _removeVideo({ video, userId })));

	Data.Base.Cache.removeCache();
};
