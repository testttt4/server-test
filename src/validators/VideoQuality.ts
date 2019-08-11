import * as Errors from "../errors";
import * as VideoFormat from "./VideoFormat";

import ffprobe from "ffprobe";
import { path as ffprobePath } from "ffprobe-static";
import { getFileExtension } from "../utils/Helper";
import { validateNumber } from "./Base";

export const validateHeight = (height: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors = validateNumber({ value: height, min: 0, max: 30000 });

	return errors.length > 0 ? [false, errors] : [true, height];
};

export const validateWidth = (width: number): [true, number] | [false, Errors.BadUserInput[]] => {
	const errors = validateNumber({ value: width, min: 0, max: 30000 });

	return errors.length > 0 ? [false, errors] : [true, width];
};

export const validateURL = async (
	url: string
): Promise<
	| [
			true,
			{
				height: number;
				width: number;
				formatName: string;
				url: string;
			}
	  ]
	| [false, Errors.BadUserInput | Errors.BadUserInput[]]
> => {
	url = url.trim();
	const urlValidation = VideoFormat.validateURL(url);

	if (!urlValidation[0]) return [false, urlValidation[1]];
	url = urlValidation[1];

	try {
		const streams = await ffprobe(url, {
			path: ffprobePath,
		});
		let { height, width } = streams.streams[0];

		const heightValidation = validateHeight(height);
		if (heightValidation[0]) height = heightValidation[1];
		const widthValidation = validateWidth(width);
		if (widthValidation[0]) width = widthValidation[1];
		const formatName = getFileExtension(url);
		const formatNameValidation = VideoFormat.validateName(formatName);

		const errors: Errors.BadUserInput[] = [];

		if (!heightValidation[0]) errors.push(...heightValidation[1]);
		if (!widthValidation[0]) errors.push(...widthValidation[1]);
		if (!formatNameValidation[0]) errors.push(...formatNameValidation[1]);

		return errors.length > 0
			? [false, errors]
			: [
					true,
					{
						height,
						width,
						formatName: getFileExtension(url),
						url,
					},
			  ];
	} catch (e) {
		return [false, [{ code: "INVALID_VALUE" }]];
	}
};

export type CreateData = {
	height: number;
	width: number;
	formats: VideoFormat.CreateData[];
};
export type ValidatedCreateData = Omit<CreateData, "formats"> & {
	formats: VideoFormat.ValidatedCreateData[];
};
export type InvalidatedData = Partial<
	Record<"height" | "width", Errors.BadUserInput | Errors.BadUserInput[]> & {
		formats: Array<VideoFormat.InvalidatedCreateData | undefined>;
	}
>;
export const validateCreateData = (data: CreateData): [true, ValidatedCreateData] | [false, InvalidatedData] => {
	const validatedData: ValidatedCreateData = {
		...data,
	};
	const errors: InvalidatedData = {};

	const heightValidation = validateHeight(data.height);
	if (heightValidation[0]) validatedData.height = heightValidation[1];
	else errors.height = heightValidation[1];

	const widthValidation = validateWidth(data.width);
	if (widthValidation[0]) validatedData.width = widthValidation[1];
	else errors.width = widthValidation[1];

	let formatsErrorFound = false;
	const formatsValidation = data.formats.map(format => {
		const formatValidation = VideoFormat.validateData(format);

		if (!formatValidation[0]) formatsErrorFound = true;

		return formatValidation;
	});

	if (formatsErrorFound)
		errors.formats = formatsValidation.map(formatValidation =>
			formatValidation[0] ? undefined : formatValidation[1]
		);

	return Object.values(errors).length > 0 ? [false, errors] : [true, validatedData];
};

export type ValidatedFromUrls = Array<{
	height: number;
	width: number;

	formats: Array<{
		name: string;
		url: string;
	}>;
}>;
export type InvalidatedFromUrls = Array<Errors.BadUserInput[] | undefined>;
export const validateFromUrls = async (
	urls: string[]
): Promise<[true, ValidatedFromUrls] | [false, InvalidatedFromUrls]> => {
	const qualities: ValidatedFromUrls = [];
	const errors: InvalidatedFromUrls = [];

	const pushQuality = (quality: { height: number; width: number; formatName: string; url: string }) => {
		const savedQuality = qualities.find(q => q.height === quality.height);

		if (savedQuality !== undefined)
			savedQuality.formats.push({
				name: quality.formatName,
				url: quality.url,
			});
		else
			qualities.push({
				...quality,
				formats: [
					{
						name: quality.formatName,
						url: quality.url,
					},
				],
			});
	};

	let qualitiesHaveError = false;
	for (const url of urls) {
		const urlValidation = await validateURL(url);

		if (!urlValidation[0]) {
			qualitiesHaveError = true;
			errors.push(Array.isArray(urlValidation[1]) ? urlValidation[1] : [urlValidation[1]]);
			break;
		}

		errors.push(undefined);
		pushQuality(urlValidation[1]);
	}

	return qualitiesHaveError ? [false, errors] : [true, qualities];
};
