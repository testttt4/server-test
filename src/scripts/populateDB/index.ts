import "core-js/stable";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "../../models";

import { Model, Sequelize } from "sequelize-typescript";
import axios, { AxiosError } from "axios";

import { Pool } from "pg";
import { QueryTypes } from "sequelize";
import { from as copyFrom } from "pg-copy-streams";
import csvStringify from "csv-stringify";
import fs from "fs";
import https from "https";
import moment from "moment";
import path from "path";
import { readVideosQualities } from "./readVideosQualities";
import { serverConfig } from "../../serverConfig";
import urljoin from "url-join";

// #region envs
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
// #endregion

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

const getNewCourseIconUrl = async (readCourse: ReadCourse): Promise<string> => {
	const isAxiosError = (response: any): response is AxiosError => "isAxiosError" in response && response.isAxiosError;
	const iconUrl = `https://open.fing.edu.uy/Images/iconCourse/${readCourse.code}_image.svg`;

	if (isAxiosError(await axios.head(iconUrl).catch(e => e))) return serverConfig.DEFAULT_COURSE_ICON_URL;

	const iconUrlSplit = iconUrl.split(".");
	const iconFileExtension = iconUrlSplit[iconUrlSplit.length - 1];
	const newIconPath = path.join(serverConfig.COURSE_ICONS_PATH, `${readCourse.code}.${iconFileExtension}`);

	await new Promise(resolve => {
		const writeStream = fs.createWriteStream(newIconPath);
		writeStream.on("close", resolve);
		https.get(iconUrl, response => response.pipe(writeStream));
	});

	return urljoin(serverConfig.COURSE_ICONS_URL, `${readCourse.code}.${iconFileExtension}`);
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

	const schema = "openfing";
	const writeDB = new Sequelize({
		database: WRITE_DB_NAME,
		port: WRITE_DB_PORT,
		dialect: "postgres",
		username: WRITE_DB_USERNAME,
		password: WRITE_DB_PASSWORD,
		host: WRITE_DB_HOST,
		define: {
			schema,
			freezeTableName: true,
		},
		logging: false,
	});

	await writeDB.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
	await writeDB.query(`CREATE SCHEMA "${schema}"`);

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
	await writeDB.sync();

	const readCourses = await readDB.query<ReadCourse>("select * from courses", { type: QueryTypes.SELECT });
	const coursesJSON: Array<{ code: string; name: string; eva: string | undefined | null }> = (await axios.get(
		"https://open.fing.edu.uy/data/courses.json"
	)).data.courses;

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

	let adminUserRole = new Models.UserRole();
	adminUserRole.name = Models.UserRoleName.Admin;
	await adminUserRole.save();

	const userUserRole = new Models.UserRole();
	userUserRole.name = Models.UserRoleName.User;
	await userUserRole.save();

	const user = new Models.User();
	user.email = "santiago.gonzalez.pereyra@fing.edu.uy";
	user.uid = "santiago.gonzalez.pereyra";
	user.name = "Santiago González";
	await user.save();

	await (async () => {
		const userUserRole = new Models.UserUserRole();
		userUserRole.userId = user.id;
		userUserRole.userRoleId = adminUserRole.id;

		await userUserRole.save();
	})();

	/////////////////////////////////////////////////

	class EntityToCreate<T extends Model> {
		private nextId = 1;
		public entities: T[] = [];

		public add = (t: T) => {
			t.id = this.nextId++;
			this.entities.push(t);
		};
	}

	const coursesToCreate = new EntityToCreate<Models.Course>();
	const courseClassListsToCreate = new EntityToCreate<Models.CourseClassList>();
	const courseClassesToCreate = new EntityToCreate<Models.CourseClass>();
	const videosToCreate = new EntityToCreate<Models.Video>();
	const videoQualitiesToCreate = new EntityToCreate<Models.VideoQuality>();
	const videoFormatsToCreate = new EntityToCreate<Models.VideoFormat>();

	if (!fs.existsSync(serverConfig.COURSE_ICONS_PATH))
		fs.mkdirSync(serverConfig.COURSE_ICONS_PATH, { recursive: true });

	await Promise.all(
		readCourses.map(async readCourse => {
			await new Promise(resolve => setTimeout(resolve));
			const course = new Models.Course();

			course.name = readCourse.name;
			course.status = !coursesJSON.find(c => c.code === readCourse.code)
				? Models.CourseStatus.Hidden
				: Models.CourseStatus.Public;
			course.code = readCourse.code;

			course.iconURL = await getNewCourseIconUrl(readCourse);
			course.eva = readCourse.url || null;
			course.semester = readCourse.semester;
			course.year = readCourse.year;
			course.createdAt = moment(readCourse.created_at).toDate();
			course.createdBy = user.id;
			course.updatedAt = moment(readCourse.updated_at).toDate();
			course.createdBy = user.id;

			coursesToCreate.add(course);

			const courseReadVideosQualities = readVideosQualities.filter(
				readVideoQuality => readVideoQuality.readVideo.course_id === readCourse.id
			);

			const courseClassList = new Models.CourseClassList();
			courseClassList.courseId = course.id;
			courseClassList.name = "Default";
			courseClassList.createdAt = moment().toDate();
			courseClassList.createdBy = user.id;
			courseClassListsToCreate.add(courseClassList);

			await Promise.all(
				courseReadVideosQualities.map(async courseReadVideoQualities => {
					const readTitle = readTitles.find(t => t.video_id === courseReadVideoQualities.readVideo.id);
					const courseClassTitle =
						(readTitle && readTitle.text) || `Clase ${courseReadVideoQualities.readVideo.number}`;

					const courseClass = new Models.CourseClass();

					const createdAt = moment(courseReadVideoQualities.readVideo.created_at).toDate();

					courseClass.courseClassListId = courseClassList.id;
					courseClass.number = courseReadVideoQualities.readVideo.number;
					courseClass.disabled = courseReadVideoQualities.readVideo.disabled || null;
					courseClass.title = courseClassTitle;
					courseClass.createdAt = createdAt;
					courseClass.createdBy = user.id;

					courseClassesToCreate.add(courseClass);

					const video = new Models.Video();

					video.courseClassId = courseClass.id;
					video.position = 1;
					video.name = "Clase";
					video.createdAt = createdAt;
					video.createdBy = user.id;

					videosToCreate.add(video);

					for (const readVideoQuality of courseReadVideoQualities.qualities) {
						const videoQuality = new Models.VideoQuality();

						videoQuality.videoId = video.id;
						videoQuality.width = readVideoQuality.width;
						videoQuality.height = readVideoQuality.height;
						videoQuality.createdAt = createdAt;
						videoQuality.createdBy = user.id;

						videoQualitiesToCreate.add(videoQuality);

						for (const readVideoFormat of readVideoQuality.formats) {
							const videoFormat = new Models.VideoFormat();

							videoFormat.videoQualityId = videoQuality.id;
							videoFormat.name = readVideoFormat.name;
							videoFormat.url = readVideoFormat.url;
							videoFormat.createdAt = createdAt;
							videoFormat.createdBy = user.id;

							videoFormatsToCreate.add(videoFormat);
						}
					}
				})
			);
		})
	);

	const toCSV = (value: unknown): any => {
		if ([undefined, null].includes(value)) return "";
		if (["string", "number", "boolean"].includes(typeof value)) return value;
		if (value instanceof Date) {
			const date = moment(value);

			return date.format("YYYY-MM-DD HH:mm:ss.SS") + date.format("Z").split(":")[0];
		}
	};

	const valuesFrom = <T extends object>(value: T, keys: Array<keyof T>): any[] =>
		keys.map(k => {
			if (k === "createdAt" && !value[k]) console.log(value);

			return value[k];
		});

	const getToCreateItem = <T extends Model>(
		entityToCreate: EntityToCreate<T>,
		model: typeof Model,
		keys: Array<keyof T>
	) => ({
		entityToCreate,
		model,
		keys,
	});

	await Promise.all(
		[
			getToCreateItem(coursesToCreate, Models.Course, [
				"id",
				"name",
				"status",
				"code",
				"iconURL",
				"eva",
				"semester",
				"year",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
			getToCreateItem(courseClassListsToCreate, Models.CourseClassList, [
				"id",
				"courseId",
				"name",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
			getToCreateItem(courseClassesToCreate, Models.CourseClass, [
				"id",
				"courseClassListId",
				"number",
				"title",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
			getToCreateItem(videosToCreate, Models.Video, [
				"id",
				"courseClassId",
				"position",
				"name",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
			getToCreateItem(videoQualitiesToCreate, Models.VideoQuality, [
				"id",
				"videoId",
				"width",
				"height",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
			getToCreateItem(videoFormatsToCreate, Models.VideoFormat, [
				"id",
				"name",
				"videoQualityId",
				"url",
				"createdAt",
				"createdBy",
				"updatedAt",
				"updatedBy",
				"deletedAt",
				"deletedBy",
			]),
		].map(
			async (
				toCreate: {
					entityToCreate: EntityToCreate<
						| Models.Course
						| Models.CourseClass
						| Models.CourseClassList
						| Models.Video
						| Models.VideoFormat
						| Models.VideoQuality
					>;
					model: typeof Model;
					keys: string[];
				},
				i: number
			) => {
				const { entities } = toCreate.entityToCreate;
				if (entities.length === 0) return;

				const stringify = async (p: any[][]) => {
					p = p.map(i => i.map(value => toCSV(value)));

					const result = await new Promise(resolve =>
						csvStringify(p, (err, output) => {
							resolve(output);
						})
					);

					return result;
				};

				const filePath = path.join(__dirname, `__${i}`);
				fs.writeFileSync(filePath, await stringify(entities.map(e => valuesFrom(e, toCreate.keys as any[]))));
				var fileStream = fs.createReadStream(filePath);

				const pool = new Pool({
					database: WRITE_DB_NAME,
					password: WRITE_DB_PASSWORD,
					port: WRITE_DB_PORT,
					user: WRITE_DB_USERNAME,
					host: WRITE_DB_HOST,
				});

				await new Promise((resolve, reject) => {
					pool.connect(async (err, client, done) => {
						const stream = client.query(
							copyFrom(
								`COPY ${(toCreate.model as typeof Model).getTableName()} (${toCreate.keys.map(
									(k: string) => `"${k}"`
								)}) FROM STDIN WITH CSV;`
							)
						);

						if (err) throw err;

						await new Promise((resolve, reject) => {
							fileStream.on("error", e => {
								done();
								reject(e);
							});
							stream.on("error", e => {
								done();
								reject(e);
							});
							stream.on("end", () => {
								done();
								resolve();
							});
							fileStream.pipe(stream);
						})
							.then(resolve)
							.catch(reject);
					});
				});

				fs.unlinkSync(filePath);
			}
		)
	);

	console.log("- done");
	process.exit(0);
})();
