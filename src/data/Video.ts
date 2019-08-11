import * as Errors from "../errors";
import * as Models from "../models";

import { getData } from "./Base";

export type FindAllOptions = {
	courseClassId: number;
	includeDeleted?: boolean | undefined;
};
export const findAll = async (options: FindAllOptions): Promise<Models.Video[]> => {
	const { videosByCourseClassId } = await getData();

	if (!options.includeDeleted) return videosByCourseClassId.get(options.courseClassId) || [];

	return Models.Video.findAll({ where: { courseClassId: options.courseClassId } });
};

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = async (options: FindOneOptions): Promise<Models.Video | undefined> => {
	const { videoById } = await getData();

	if (!options.includeDeleted) return videoById.get(options.id);

	return (
		(await Models.Video.findOne({
			where: {
				id: options.id,
			},
			order: ["position", "ASC"],
		})) || undefined
	);
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.Video> => {
	const video = await findOne(options);
	if (video === undefined) throw new Errors.ObjectNotFoundError("El video no existe.");

	return video;
};
