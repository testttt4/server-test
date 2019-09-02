import * as fs from "fs";
import * as jwt from "jsonwebtoken";

import { FileUpload } from "graphql-upload";
import ffprobe from "ffprobe";
import { path as ffprobePath } from "ffprobe-static";
import path from "path";
import { serverConfig } from "../serverConfig";
import urlJoin from "url-join";
import uuidV4 from "uuid/v4";

export const identity = <T>(value: T): T => value;

export const getUUID = () => uuidV4();

export const pick = <T extends any, TKeys extends keyof T>(obj: T, keys: TKeys[]): Pick<T, TKeys> =>
	keys.reduce(
		(result, key) => {
			result[key] = obj[key];
			return result;
		},
		{} as any
	);

export const getFileExtension = (filename: string): string => {
	return filename.slice((Math.max(0, filename.lastIndexOf(".")) || Infinity) + 1);
};

export const saveFile = async (
	fileUpload: FileUpload,
	getFilename: (options: { filename: string; extension: string; uuid: string }) => string
): Promise<{ path: string; unlink: () => void; url: string }> => {
	const { createReadStream, filename } = await fileUpload;

	const newPath = path.resolve(
		serverConfig.FILES_PATH,
		getFilename({ filename, extension: getFileExtension(filename), uuid: getUUID() })
	);

	await new Promise((resolve, reject) =>
		createReadStream()
			.on("error", error => reject(error))
			.pipe(fs.createWriteStream(newPath))
			.on("error", error => reject(error))
			.on("finish", () => resolve())
	);

	return {
		path: newPath,
		unlink: () => fs.unlinkSync(newPath),
		url: urlJoin(serverConfig.FILES_URL, path.relative(serverConfig.FILES_PATH, newPath)),
	};
};

export const getTokenPayload = (token: string): { me: { id: number } } | null => {
	try {
		const payload = jwt.verify(token, serverConfig.JWT_SECRET);

		if (payload && typeof payload === "object") {
			const { id } = payload as Record<string, string>;

			if (typeof id === "number") return { me: { id } };
		}
	} catch {}

	return null;
};

export const getVideoResolution = (url: string): Promise<{ width: number; height: number } | null> =>
	ffprobe(url, {
		path: ffprobePath,
	})
		.then(streams => {
			const streamWithResolution = streams.streams.find(s => s.width && s.height);

			if (!streamWithResolution) throw new Error(`Resolution not found for ${url}`);

			const { height, width } = streamWithResolution;

			return { height, width };
		})
		.catch(() => null);
