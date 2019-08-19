import "core-js/stable";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "../../models";

import { Model, Sequelize } from "sequelize-typescript";
import { Pool, PoolClient } from "pg";

import { QueryTypes } from "sequelize";
import axios from "axios";
import { from as copyFrom } from "pg-copy-streams";
import { courseIconUrlByCode } from "./courseIconUrlByCode";
import csvStringify from "csv-stringify";
import fs from "fs";
import moment from "moment";
import path from "path";
import { readVideosQualities } from "./readVideosQualities";

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

	const adminUserRole = new Models.UserRole();
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

	const getCourseIconUrlByCode = await (async () => {
		// const filePath = path.join(__dirname, "..", "..", "courseIconUrlByCode.json");

		// let data: Record<string, string> = {};
		// if (!fs.existsSync(filePath)) {
		// 	await Promise.all(
		// 		readCourses.map(async readCourse => {
		// 			let iconURL:
		// 				| string
		// 				| undefined = `https://open.fing.edu.uy/Images/iconCourse/${readCourse.code}_image`;

		// 			let iconResponse = await axios.head(`${iconURL}.svg`).catch(e => e);

		// 			if (iconResponse.status === 404) {
		// 				iconResponse = await axios.head(`${iconURL}.png`).catch(e => e);

		// 				if (iconResponse.status === 404)
		// 					iconURL = "https://open.fing.edu.uy/_files/assets/course_icons/default-icon.svg";
		// 				else iconURL += ".png";
		// 			} else iconURL += ".svg";

		// 			data[readCourse.code] = iconURL;
		// 		})
		// 	);

		// 	fs.writeFileSync(filePath, JSON.stringify(data));
		// } else data = JSON.parse(fs.readFileSync(filePath, "utf8"));

		return (code: string) => {
			if (!courseIconUrlByCode[code]) throw new Error(`${code} icon not found.`);
			return courseIconUrlByCode[code];
		};
	})();

	await Promise.all(
		readCourses.map(async readCourse => {
			await new Promise(resolve => setTimeout(resolve));
			const course = new Models.Course();

			course.name = readCourse.name;
			course.disabled = !coursesJSON.find(c => c.code === readCourse.code);
			course.code = readCourse.code;

			course.iconURL = getCourseIconUrlByCode(readCourse.code);
			course.eva = readCourse.url || null;
			course.semester = readCourse.semester;
			course.year = readCourse.year;
			course.createdAt = moment(readCourse.created_at).toDate();
			course.createdBy = user.id;
			course.updatedAt = moment(readCourse.updated_at).toDate();
			course.createdBy = user.id;

			coursesToCreate.add(course);
			// console.log(
			// 	`- courseClass ${JSON.stringify(pick(course, ["id", "code", "name", "iconURL", "eva"]))} created`
			// );

			const courseReadVideosQualities = readVideosQualities.filter(
				readVideoQuality => readVideoQuality.readVideo.course_id === readCourse.id
			);

			const courseClassList = new Models.CourseClassList();
			courseClassList.courseId = course.id;
			courseClassList.name = "Default";
			courseClassList.createdAt = moment().toDate();
			courseClassList.createdBy = user.id;
			courseClassListsToCreate.add(courseClassList);

			// console.log(`- courseClass ${JSON.stringify(pick(courseClassList, ["id", "courseId", "name"]))} created`);

			await Promise.all(
				courseReadVideosQualities.map(async courseReadVideoQualities => {
					const readTitle = readTitles.find(t => t.video_id === courseReadVideoQualities.readVideo.id);
					const courseClassTitle =
						(readTitle && readTitle.text) || `Clase ${courseReadVideoQualities.readVideo.number}`;

					const courseClass = new Models.CourseClass();

					courseClass.courseClassListId = courseClassList.id;
					courseClass.number = courseReadVideoQualities.readVideo.number;
					courseClass.disabled = courseReadVideoQualities.readVideo.disabled || null;
					courseClass.title = courseClassTitle;
					courseClass.createdAt = moment().toDate();
					courseClass.createdBy = user.id;

					courseClassesToCreate.add(courseClass);
					// console.log(
					// 	`- courseClass ${JSON.stringify(
					// 		pick(courseClass, ["id", "courseClassListId", "title", "disabled"])
					// 	)} created`
					// );

					const video = new Models.Video();

					video.courseClassId = courseClass.id;
					video.position = 1;
					video.name = "Clase";
					video.createdAt = moment().toDate();
					video.createdBy = user.id;

					videosToCreate.add(video);

					// console.log(`- video ${JSON.stringify(pick(video, ["id", "courseClassId", "name"]))} created`);

					for (const readVideoQuality of courseReadVideoQualities.qualities) {
						const videoQuality = new Models.VideoQuality();

						videoQuality.videoId = video.id;
						videoQuality.width = readVideoQuality.width;
						videoQuality.height = readVideoQuality.height;
						videoQuality.createdAt = moment().toDate();
						videoQuality.createdBy = user.id;

						videoQualitiesToCreate.add(videoQuality);

						// console.log(
						// 	`- videoQuality ${JSON.stringify(
						// 		pick(videoQuality, ["id", "videoId", "width", "height"])
						// 	)} created`
						// );

						for (const readVideoFormat of readVideoQuality.formats) {
							const videoFormat = new Models.VideoFormat();

							videoFormat.videoQualityId = videoQuality.id;
							videoFormat.name = readVideoFormat.name;
							videoFormat.url = readVideoFormat.url;
							videoFormat.createdAt = moment().toDate();
							videoFormat.createdBy = user.id;

							videoFormatsToCreate.add(videoFormat);

							// console.log(
							// 	`- videoFormat ${JSON.stringify(
							// 		pick(videoFormat, ["id", "videoQualityId", "name", "url"])
							// 	)} created`
							// );
						}
					}
				})
			);
		})
	);

	const toCSV = (value: unknown): any => {
		if ([undefined, null].includes(value)) return "";
		if (["string", "number", "boolean"].includes(typeof value)) return value;
		// if (typeof value === "boolean") return value ? "t" : "f";
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
				"disabled",
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
		].map(async (toCreate, i: number) => {
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
			fs.writeFileSync(filePath, await stringify(entities.map(e => valuesFrom(e, toCreate.keys))));
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

			// fileContent +=
			// 	`COPY ${(toCreate.model as typeof Model).getTableName()} (${toCreate.keys.map(
			// 		(k: string) => `"${k}"`
			// 	)}) FROM STDIN WITH CSV;\n` +
			// 	queryRowData +
			// 	"\\.\n\n";

			// for (const line of [
			// 	`COPY ${(toCreate.model as typeof Model).getTableName()} (${toCreate.keys.map(
			// 		(k: string) => `"${k}"`
			// 	)}) FROM STDIN WITH CSV;`,
			// 	...queryRowData.split("\n"),
			// ]) {
			// 	writeDB.query(line);
			// }

			// await writeDB.query(
			// 	`COPY ${(toCreate.model as typeof Model).getTableName()} (${toCreate.keys.map(
			// 		(k: string) => `"${k}"`
			// 	)}) FROM STDIN;\n` +
			// 		queryRowData.join("\n") +
			// 		"\n\\.\n\n"
			// );
			fs.unlinkSync(filePath);
		})
	);

	// fs.writeFileSync(filePath, fileContent);

	// await writeDB.query(fileContent, { raw: true, type: QueryTypes.RAW });

	console.log("- done");
})();
