import axios, { AxiosError } from "axios";

import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import fs from "fs";
import { loadEnv } from "./loadEnv";
import { readVideosQualities as oldReadVideosQualities } from "../src/scripts/populateDB/readVideosQualities";
import path from "path";
import { projectPath } from "../config/projectPath";

loadEnv();

const { env } = process;

const { READ_DB_NAME } = env;
if (!READ_DB_NAME) throw new Error("READ_DB_NAME not defined");

if (!env.READ_DB_PORT) throw new Error("READ_DB_PORT variable not defined");
const READ_DB_PORT = Number(env.READ_DB_PORT);
if (!READ_DB_PORT) throw new Error("Invalid READ_DB_PORT value. Must be number");

const { READ_DB_USERNAME } = env;
if (!READ_DB_USERNAME) throw new Error("READ_DB_USERNAME not defined");

const { READ_DB_PASSWORD } = env;
if (!READ_DB_PASSWORD) throw new Error("READ_DB_PASSWORD not defined");

const { READ_DB_HOST } = env;
if (!READ_DB_HOST) throw new Error("READ_DB_HOST not defined");

type ReadCourse = {
	id: number;
	code: string | undefined | null;
	name: string | undefined | null;
	url: string | undefined | null;
	semester: number | undefined | null;
	year: number | undefined | null;
	created_at: string | undefined | null;
	updated_at: string | undefined | null;
};

type ReadVideo = {
	id: number;
	number: number | undefined | null;
	disabled: boolean | undefined | null;
	course_id: number | undefined | null;
	created_at: string | undefined | null;
	updated_at: string | undefined | null;
};

const getVideoResolution = (url: string): Promise<{ width: number; height: number } | null> =>
	ffprobe(url, {
		path: ffprobeStatic.path,
	})
		.then(streams => {
			const streamWithResolution = streams.streams.find(s => s.width && s.height);

			if (!streamWithResolution) throw new Error(`Resolution not found for ${url}`);

			const { height, width } = streamWithResolution;

			return { height, width };
		})
		.catch(() => null);

(async () => {
	const readDB = new Sequelize({
		database: READ_DB_NAME,
		port: READ_DB_PORT,
		dialect: "postgres",
		username: READ_DB_USERNAME,
		password: READ_DB_PASSWORD,
		host: READ_DB_HOST,
		define: {
			freezeTableName: true,
		},
	});

	const readCourses = await readDB.query<ReadCourse>("select * from courses", { type: QueryTypes.SELECT });
	const readVideos = await readDB.query<ReadVideo>("select * from videos", { type: QueryTypes.SELECT });

	const readVideosQualities: Array<{
		readVideo: {
			id: number;
			number: number;
			disabled: boolean;
			course_id: number;
			created_at: string;
			updated_at: string;
		};
		qualities: Array<{
			height: number;
			width: number;
			formats: Array<{ name: string; url: string }>;
		}>;
	}> = [...oldReadVideosQualities];

	const isAxiosError = (response: any): response is AxiosError => "isAxiosError" in response && response.isAxiosError;

	const times: Record<number, number> = {};

	const promiseFactory = readVideos
		.filter(
			readVideo =>
				!readVideosQualities.some(readVideosQualities => readVideosQualities.readVideo.id === readVideo.id)
		)
		.map(readVideo => async (): Promise<boolean> => {
			const i = readVideo.id;
			if (!times[i]) times[i] = 1;
			else times[i] += 1;

			console.log(`trying ${i}`, times[i]);
			await new Promise(resolve => setTimeout(resolve));
			const readCourse = readCourses.find(rc => rc.id === readVideo.course_id);

			if (!readCourse) {
				console.log(`Course with id ${readVideo.course_id} not found`);

				return true;
			}

			const fillWithZeros = (classNo: number): string => {
				let result = classNo.toString();

				while (result.length < 2) result = `0${result}`;

				return result;
			};

			const baseVideoURL = `http://openfing-video.fing.edu.uy/media/${readCourse.code}/${
				readCourse.code
			}_${fillWithZeros(Number(readVideo.number))}`;

			const readVideoQualities: Array<{
				height: number;
				width: number;
				formats: Array<{ name: string; url: string }>;
			}> = [];

			const pushQuality = (quality: { height: number; width: number; formatName: string; url: string }) => {
				const savedQuality = readVideoQualities.find(q => q.height === quality.height);

				if (savedQuality !== undefined)
					savedQuality.formats.push({
						name: quality.formatName,
						url: quality.url,
					});
				else
					readVideoQualities.push({
						width: quality.width,
						height: quality.height,
						formats: [
							{
								name: quality.formatName,
								url: quality.url,
							},
						],
					});
			};

			const testVideoUrl = async (format: string) => {
				const videoRequestURL = `${baseVideoURL}.${format}`;
				const videoResponse = await axios.head(videoRequestURL).catch(e => e);

				if (!isAxiosError(videoResponse)) {
					const resolution = await getVideoResolution(videoRequestURL);

					if (resolution !== null) {
						pushQuality({
							formatName: format,
							url: videoRequestURL,
							height: resolution.height,
							width: resolution.width,
						});

						return true;
					}
				} else if (videoResponse.response && videoResponse.response.status === 404) return true;

				if (times[i] && times[i] > 2) console.log(videoResponse);

				return false;
			};

			const result = await Promise.all([testVideoUrl("webm"), testVideoUrl("mp4")]).then(
				results => !results.some(r => !r)
			);

			if (result)
				readVideosQualities.push({
					qualities: readVideoQualities,
					readVideo,
				});
			else console.log(`unsuccessful ${i}`);

			return result;
		});

	const execPromise = async (p: () => Promise<boolean>) => {
		const successful = await p();

		if (!successful) promiseFactory.unshift(p);

		if (promiseFactory.length) await execPromise(promiseFactory.shift());
	};

	const writeFile = () =>
		fs.writeFileSync(
			path.join(projectPath, "src", "scripts", "populateDB", "readVideosQualities.ts"),
			`export const readVideosQualities = ${JSON.stringify(readVideosQualities, undefined, 2)}`
		);

	const interval = setInterval(writeFile, 5000);

	await Promise.all(promiseFactory.splice(0, 5).map(execPromise));

	clearInterval(interval);
	writeFile();

	process.exit(0);
})();
