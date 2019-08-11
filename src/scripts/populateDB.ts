import "core-js/stable";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "../models";

import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { UserRoleName } from "../models";
import { fetch } from "apollo-server-env";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import moment from "moment";

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

const { WRITE_DB_NAME } = env;
if (!WRITE_DB_NAME) throw new Error("WRITE_DB_NAME not defined");

if (!env.WRITE_DB_PORT) throw new Error("WRITE_DB_PORT variable not defined");
const WRITE_DB_PORT = Number(env.WRITE_DB_PORT);
if (!WRITE_DB_PORT) throw new Error("Invalid WRITE_DB_PORT value. Must be number");

const { WRITE_DB_USERNAME } = env;
if (!WRITE_DB_USERNAME) throw new Error("WRITE_DB_USERNAME not defined");

const { WRITE_DB_PASSWORD } = env;
if (!WRITE_DB_PASSWORD) throw new Error("WRITE_DB_PASSWORD not defined");

const { WRITE_DB_HOST } = env;
if (!WRITE_DB_HOST) throw new Error("WRITE_DB_HOST not defined");

const getVideoResolution = (url: string): Promise<{ width: number; height: number } | null> =>
	ffprobe(url, {
		path: ffprobeStatic.path,
	})
		.then(streams => {
			const { height, width } = streams.streams[0];

			return { height, width };
		})
		.catch(async () => {
			return null;
		});

const pick = <T>(object: T, keys: Array<keyof T>): Partial<T> => {
	let result: Partial<T> = {};

	keys.forEach(k => (result[k] = object[k]));

	return result;
};

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

	const writeDB = new Sequelize({
		database: WRITE_DB_NAME,
		port: WRITE_DB_PORT,
		dialect: "postgres",
		username: WRITE_DB_USERNAME,
		password: WRITE_DB_PASSWORD,
		host: WRITE_DB_HOST,
		define: {
			schema: "openfing",
			freezeTableName: true,
		},
	});

	await writeDB.query("DROP SCHEMA IF EXISTS openfing CASCADE");
	await writeDB.query("CREATE SCHEMA openfing");

	writeDB.addModels([
		Models.Course,
		Models.CourseClass,
		Models.CourseClassList,
		Models.FAQ,
		Models.User,
		Models.UserRole,
		Models.UserUserRole,
		Models.Video,
		Models.VideoFormat,
		Models.VideoQuality,
	]);
	writeDB.sync();

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
	const readCourses = await readDB.query<ReadCourse>("select * from courses", { type: QueryTypes.SELECT });
	const coursesJSON: Array<{ code: string; name: string; eva: string | undefined | null }> = (await (await fetch(
		"https://open.fing.edu.uy/data/courses.json",
		{ method: "GET" }
	)).json()).courses;

	type ReadTitle = {
		id: number;
		text: string | undefined | null;
		username: string | undefined | null;
		video_id: number | undefined | null;
		created_at: string | undefined | null;
		updated_at: string | undefined | null;
	};
	const readTitles = await readDB.query<ReadTitle>("select * from titles", { type: QueryTypes.SELECT });

	type ReadVideo = {
		id: number;
		number: number | undefined | null;
		disabled: boolean | undefined | null;
		course_id: number | undefined | null;
		created_at: string | undefined | null;
		updated_at: string | undefined | null;
	};
	const readVideos = await readDB.query<ReadVideo>("select * from videos", { type: QueryTypes.SELECT });

	const adminUserRole = new Models.UserRole();
	adminUserRole.name = UserRoleName.Admin;
	await adminUserRole.save();

	const userUserRole = new Models.UserRole();
	userUserRole.name = UserRoleName.User;
	await userUserRole.save();

	const user = new Models.User();
	user.email = "santiago.gonzalez.pereyra@fing.edu.uy";
	user.uid = "santiago.gonzalez.pereyra";
	user.name = "Santiago González";
	await user.save();

	for (const readCourse of readCourses) {
		const course = new Models.Course();

		course.name = readCourse.name;
		course.disabled = !coursesJSON.find(c => c.code === readCourse.code);
		course.code = readCourse.code;

		let iconURL: string | undefined = `https://open.fing.edu.uy/Images/iconCourse/${readCourse.code}_image`;

		let iconResponse = await fetch(`${iconURL}.svg`, { method: "HEAD" });

		if (iconResponse.status === 404) {
			iconResponse = await fetch(`${iconURL}.png`, { method: "HEAD" });

			if (iconResponse.status === 404)
				iconURL = "https://open.fing.edu.uy/_files/assets/course_icons/default-icon.svg";
			else iconURL += ".png";
		} else iconURL += ".svg";

		course.iconURL = iconURL;
		course.eva = readCourse.url || null;
		course.semester = readCourse.semester;
		course.year = readCourse.year;
		course.createdAt = moment(readCourse.created_at).toDate();
		course.createdBy = user.id;
		course.updatedAt = moment(readCourse.updated_at).toDate();
		course.createdBy = user.id;

		await course.save();
		console.log(`- courseClass ${JSON.stringify(pick(course, ["id", "code", "name", "iconURL", "eva"]))} created`);

		const courseVideos = readVideos.filter(v => v.course_id === readCourse.id);

		const courseClassList = new Models.CourseClassList();
		courseClassList.courseId = course.id;
		courseClassList.name = "Default";
		courseClassList.createdAt = moment().toDate();
		courseClassList.createdBy = user.id;
		await courseClassList.save();

		console.log(`- courseClass ${JSON.stringify(pick(courseClassList, ["id", "courseId", "name"]))} created`);

		for (const courseVideo of courseVideos) {
			const readTitle = readTitles.find(t => t.video_id === courseVideo.id);
			const courseClassTitle = (readTitle && readTitle.text) || `Clase ${courseVideo.number}`;

			const fillWithZeros = (classNo: number): string => {
				let result = classNo.toString();

				while (result.length < 2) result = `0${result}`;

				return result;
			};
			const baseVideoURL = `http://openfing-video.fing.edu.uy/media/${course.code}/${course.code}_${fillWithZeros(
				Number(courseVideo.number)
			)}`;

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
						...quality,
						formats: [
							{
								name: quality.formatName,
								url: quality.url,
							},
						],
					});
			};

			let format = "webm";
			let videoRequestURL = `${baseVideoURL}.${format}`;
			let videoResponse = await fetch(videoRequestURL, { method: "HEAD" });
			if (videoResponse.status !== 404) {
				const resolution = await getVideoResolution(videoRequestURL);

				if (resolution !== null)
					pushQuality({
						...resolution,
						formatName: format,
						url: videoRequestURL,
					});
			}

			format = "mp4";
			videoRequestURL = `${baseVideoURL}.${format}`;
			videoResponse = await fetch(videoRequestURL, { method: "HEAD" });
			if (videoResponse.status !== 404) {
				const resolution = await getVideoResolution(videoRequestURL);

				if (resolution !== null)
					pushQuality({
						...resolution,
						formatName: format,
						url: videoRequestURL,
					});
			}

			const courseClass = new Models.CourseClass();

			courseClass.courseClassListId = courseClassList.id;
			courseClass.number = courseVideo.number;
			courseClass.disabled = courseVideo.disabled || null;
			courseClass.title = courseClassTitle;
			courseClass.createdAt = moment().toDate();
			courseClass.createdBy = user.id;

			await courseClass.save();
			console.log(
				`- courseClass ${JSON.stringify(
					pick(courseClass, ["id", "courseClassListId", "title", "disabled"])
				)} created`
			);

			const video = new Models.Video();

			video.courseClassId = courseClass.id;
			video.position = 1;
			video.name = "Clase";
			video.createdAt = moment().toDate();
			video.createdBy = user.id;

			await video.save();

			console.log(`- video ${JSON.stringify(pick(video, ["id", "courseClassId", "name"]))} created`);

			for (const readVideoQuality of readVideoQualities) {
				const videoQuality = new Models.VideoQuality();

				videoQuality.videoId = video.id;
				videoQuality.width = readVideoQuality.width;
				videoQuality.height = readVideoQuality.height;
				videoQuality.createdAt = moment().toDate();
				videoQuality.createdBy = user.id;

				await videoQuality.save();

				console.log(
					`- videoQuality ${JSON.stringify(pick(videoQuality, ["id", "videoId", "width", "height"]))} created`
				);

				for (const readVideoFormat of readVideoQuality.formats) {
					const videoFormat = new Models.VideoFormat();

					videoFormat.videoQualityId = videoQuality.id;
					videoFormat.name = readVideoFormat.name;
					videoFormat.url = readVideoFormat.url;
					videoFormat.createdAt = moment().toDate();
					videoFormat.createdBy = user.id;

					await videoFormat.save();

					console.log(
						`- videoFormat ${JSON.stringify(
							pick(videoFormat, ["id", "videoQualityId", "name", "url"])
						)} created`
					);
				}
			}
		}
	}

	readDB.close();
	console.log("- done");
})();
