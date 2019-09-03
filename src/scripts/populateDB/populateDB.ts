import "core-js/stable";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "../../models";

import { Model, Sequelize } from "sequelize-typescript";
import axios, { AxiosError } from "axios";
import { getVideoResolution, identity } from "../../utils/Helper";

import { Pool } from "pg";
import { QueryTypes } from "sequelize";
import { readVideosQualities as _readVideosQualities } from "./readVideosQualities.json";
import { from as copyFrom } from "pg-copy-streams";
import csvStringify from "csv-stringify";
import fs from "fs";
import https from "https";
import moment from "moment";
import path from "path";
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
	code: string;
	name: string;
	url: string | undefined | null;
	semester: number;
	year: number;
	created_at: string;
	updated_at: string;
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
	const readVideosQualitiesFilePath = path.join(serverConfig.FILES_PATH, "_readVideosQualities.json");

	if (!fs.existsSync(serverConfig.FILES_PATH)) fs.mkdirSync(serverConfig.FILES_PATH, { recursive: true });

	if (!fs.existsSync(readVideosQualitiesFilePath))
		fs.writeFileSync(readVideosQualitiesFilePath, JSON.stringify({ readVideosQualities: _readVideosQualities }));

	await new Promise(resolve => setTimeout(resolve, 0));

	const readVideosQualities: typeof _readVideosQualities = JSON.parse(
		fs.readFileSync(readVideosQualitiesFilePath, "utf8")
	).readVideosQualities;

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
		Models.CourseEdition,
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
	const faqsJSON: Array<{ title: string; content: string }> = (await axios.get(
		"https://open.fing.edu.uy/data/faq.json"
	)).data.faqs;

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
		number: number;
		disabled: boolean;
		youtube: any;
		course_id: number;
		created_at: string;
		updated_at: string;
	};
	const readVideos = await readDB.query<ReadVideo>("select * from videos", { type: QueryTypes.SELECT });

	let userRoleData: Required<Pick<Models.UserRole, keyof Omit<typeof Models.UserRoleAttributes, "id">>> = {
		name: "admin",
		createdAt: moment().toDate(),
		updatedAt: moment().toDate(),
		deletedAt: null,
	};
	let adminUserRole = new Models.UserRole(userRoleData);
	await adminUserRole.save();

	userRoleData.name = "user";
	const userUserRole = new Models.UserRole(userRoleData);
	await userUserRole.save();

	const userData: Required<Pick<Models.User, keyof Omit<typeof Models.UserAttributes, "id">>> = {
		email: "santiago.gonzalez.pereyra@fing.edu.uy",
		uid: "santiago.gonzalez.pereyra",
		name: "Santiago González",
		createdAt: moment().toDate(),
		updatedAt: moment().toDate(),
		deletedAt: null,
	};
	const user = new Models.User(userData);
	await user.save();

	await (async () => {
		const userUserRoleData: Required<
			Pick<Models.UserUserRole, keyof Omit<typeof Models.UserUserRoleAttributes, "id">>
		> = {
			userId: user.id,
			userRoleId: adminUserRole.id,
			createdAt: moment().toDate(),
			updatedAt: moment().toDate(),
			deletedAt: null,
		};
		const userUserRole = new Models.UserUserRole(userUserRoleData);

		await userUserRole.save();
	})();

	class EntityToCreate<T extends Model> {
		private nextId = 1;
		public entities: T[] = [];

		public add = (t: T) => {
			t.id = this.nextId++;
			this.entities.push(t);
		};
	}

	const coursesToCreate = new EntityToCreate<Models.Course>();
	const courseEditionsToCreate = new EntityToCreate<Models.CourseEdition>();
	const courseClassListsToCreate = new EntityToCreate<Models.CourseClassList>();
	const courseClassesToCreate = new EntityToCreate<Models.CourseClass>();
	const videosToCreate = new EntityToCreate<Models.Video>();
	const videoQualitiesToCreate = new EntityToCreate<Models.VideoQuality>();
	const videoFormatsToCreate = new EntityToCreate<Models.VideoFormat>();
	const faqsToCreate = new EntityToCreate<Models.FAQ>();

	faqsJSON.forEach(faq => {
		faqsToCreate.add(
			new Models.FAQ(
				identity<Required<Pick<Models.FAQ, keyof Omit<typeof Models.FAQAttributes, "id">>>>({
					title: faq.title,
					content: faq.content,
					isHTML: faq.content.includes("<"),
					createdAt: moment().toDate(),
					createdById: user.id,
					updatedAt: moment().toDate(),
					updatedById: user.id,
					deletedAt: null,
					deletedById: null,
				})
			)
		);
	});

	if (!fs.existsSync(serverConfig.COURSE_ICONS_PATH))
		fs.mkdirSync(serverConfig.COURSE_ICONS_PATH, { recursive: true });

	const getCleanReadCourseName = (readCourse: ReadCourse) =>
		readCourse.name.replace(/\( *(Práctico|Teórico|Edición).+\)/g, "").trim();

	const getCleanReadCourseCode = (readCourse: ReadCourse): string => {
		const { code, year } = readCourse;

		const yearString = year.toString();

		const posibleEndings = [`-${yearString}`, yearString, `-${yearString.substr(-2)}`, yearString.substr(-2)];

		const res = posibleEndings.reduce(
			(result, posibleEnding) => (result.endsWith(posibleEnding) ? result.replace(posibleEnding, "") : result),
			code
		);

		return res;
	};

	const coursesByCode = new Map<string, Models.Course>();
	const courseEditionsByCode = new Map<string, Models.CourseEdition[]>();

	readCourses.find(c => c.code === "vyo15")!.year = 2015;

	for (const readCourse of readCourses) {
		const cleanCourseCode = getCleanReadCourseCode(readCourse);
		let course = coursesByCode.get(cleanCourseCode);

		if (!course) {
			const courseData: Required<Pick<Models.Course, keyof Omit<typeof Models.CourseAttributes, "id">>> = {
				name: getCleanReadCourseName(readCourse),
				visibility: !coursesJSON.find(c => c.code === readCourse.code)
					? Models.CourseVisibility.hidden
					: Models.CourseVisibility.public,
				code: cleanCourseCode,
				iconURL: await getNewCourseIconUrl(readCourse),
				eva: readCourse.url || null,
				createdAt: moment(readCourse.created_at).toDate(),
				createdById: user.id,
				updatedAt: moment(readCourse.updated_at).toDate(),
				updatedById: user.id,
				deletedAt: null,
				deletedById: undefined,
			};

			course = new Models.Course(courseData);
			coursesByCode.set(cleanCourseCode, course);

			coursesToCreate.add(course);
		}

		const courseEditions = courseEditionsByCode.get(cleanCourseCode);
		let edition =
			courseEditions &&
			courseEditions.find(e => e.year === readCourse.year && e.semester === readCourse.semester);

		if (!edition) {
			const courseEditionData: Required<
				Pick<Models.CourseEdition, keyof Omit<typeof Models.CourseEditionAttributes, "id">>
			> = {
				name: `Edición ${readCourse.year}, ${
					readCourse.semester === 1 ? "primer semestre" : "segundo semestre"
				}`,
				year: readCourse.year,
				semester: readCourse.semester,
				courseId: course.id,
				visibility:
					course.visibility === Models.CourseVisibility.disabled
						? Models.CourseEditionVisibility.disabled
						: Models.CourseEditionVisibility.public,
				createdAt: moment(readCourse.created_at).toDate(),
				createdById: user.id,
				updatedAt: moment(readCourse.updated_at).toDate(),
				updatedById: user.id,
				deletedAt: null,
				deletedById: undefined,
			};

			edition = new Models.CourseEdition(courseEditionData);

			courseEditionsToCreate.add(edition);

			if (courseEditions) courseEditions.push(edition);
			else courseEditionsByCode.set(cleanCourseCode, [edition]);
		}

		const courseClassListData: Required<
			Pick<Models.CourseClassList, keyof Omit<typeof Models.CourseClassListAttributes, "id">>
		> = {
			courseEditionId: edition.id,
			name: readCourse.name.includes("Práctico")
				? "Práctico"
				: readCourse.name.includes("Teórico")
				? "Teórico"
				: "Default",
			visibility: edition.visibility,
			createdAt: moment(readCourse.created_at).toDate(),
			createdById: user.id,
			updatedAt: moment(readCourse.updated_at).toDate(),
			updatedById: user.id,
			deletedAt: null,
			deletedById: undefined,
		};
		const courseClassList = new Models.CourseClassList(courseClassListData);
		courseClassListsToCreate.add(courseClassList);

		const isAxiosError = (response: any): response is AxiosError =>
			"isAxiosError" in response && response.isAxiosError;
		const times: Record<number, number> = {};
		const getReadVideoQualities = async (
			readVideo: ReadVideo
		): Promise<
			| Array<{
					width: number;
					height: number;
					formats: Array<{
						name: string;
						url: string;
					}>;
			  }>
			| false
		> => {
			const i = readVideo.id;

			if (!times[i]) times[i] = 1;
			else times[i] += 1;

			await new Promise(resolve => setTimeout(resolve, 0));
			const readCourse = readCourses.find(rc => rc.id === readVideo.course_id);

			if (!readCourse) {
				console.log(`Course with id ${readVideo.course_id} not found`);

				return [];
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

			if (result) return readVideoQualities;

			console.log(`unsuccessful ${i}`);

			return false;
		};

		const courseReadVideos = readVideos.filter(rv => rv.course_id === readCourse.id);

		for (const readVideo of courseReadVideos) {
			let qualities =
				(readVideosQualities.find(rvq => rvq.readVideo.id === readVideo.id) || { qualities: undefined })
					.qualities || (false as false);

			let i = 0;
			while (!qualities) {
				!i && console.log(`qualities not found for readVideo id: ${readVideo.id}`);
				i && console.log(`fetching qualities for readVideo ${readVideo.id}: ${i} times`);
				qualities = await getReadVideoQualities(readVideo);

				if (qualities)
					readVideosQualities.push({
						qualities,
						readVideo,
					});
			}

			const readTitle = readTitles.find(t => t.video_id === readVideo.id);
			const courseClassTitle = (readTitle && readTitle.text) || `Clase ${readVideo.number}`;

			const createdAt = moment(readVideo.created_at).toDate();
			const createdById = user.id;
			const updatedAt = moment(readVideo.updated_at).toDate();
			const updatedById = user.id;

			const courseClassData: Required<
				Pick<Models.CourseClass, keyof Omit<typeof Models.CourseClassAttributes, "id">>
			> = {
				courseClassListId: courseClassList.id,
				number: readVideo.number,
				disabled: readVideo.disabled || null,
				title: courseClassTitle,
				createdAt,
				createdById,
				updatedAt,
				updatedById,
				deletedAt: null,
				deletedById: undefined,
			};
			const courseClass = new Models.CourseClass(courseClassData);

			courseClassesToCreate.add(courseClass);

			const videoData: Required<Pick<Models.Video, keyof Omit<typeof Models.VideoAttributes, "id">>> = {
				courseClassId: courseClass.id,
				position: 1,
				name: "Clase",
				createdAt,
				createdById,
				updatedAt,
				updatedById,
				deletedAt: null,
				deletedById: undefined,
			};
			const video = new Models.Video(videoData);

			videosToCreate.add(video);

			for (const readVideoQuality of qualities) {
				const videoQualityData: Required<
					Pick<Models.VideoQuality, keyof Omit<typeof Models.VideoQualityAttributes, "id">>
				> = {
					videoId: video.id,
					width: readVideoQuality.width,
					height: readVideoQuality.height,
					createdAt,
					createdById,
					updatedAt,
					updatedById,
					deletedAt: null,
					deletedById: undefined,
				};
				const videoQuality = new Models.VideoQuality(videoQualityData);

				videoQualitiesToCreate.add(videoQuality);

				for (const readVideoFormat of readVideoQuality.formats) {
					const videoFormatData: Required<
						Pick<Models.VideoFormat, keyof Omit<typeof Models.VideoFormatAttributes, "id">>
					> = {
						videoQualityId: videoQuality.id,
						name: readVideoFormat.name,
						url: readVideoFormat.url,
						createdAt,
						createdById,
						updatedAt,
						updatedById,
						deletedAt: null,
						deletedById: undefined,
					};
					const videoFormat = new Models.VideoFormat(videoFormatData);

					videoFormatsToCreate.add(videoFormat);
				}
			}
		}
	}

	const toCSV = (value: unknown): any => {
		if ([undefined, null].some(i => i === value)) return "";
		if (typeof value === "boolean") return value ? "t" : "f";
		if (["string", "number"].includes(typeof value)) return value;
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
		keys: string[]
	) => ({
		entityToCreate,
		model,
		keys,
	});

	let i = 0;
	for (const toCreate of [
		getToCreateItem(coursesToCreate, Models.Course, Object.keys(Models.CourseAttributes)),
		getToCreateItem(courseEditionsToCreate, Models.CourseEdition, Object.keys(Models.CourseEditionAttributes)),
		getToCreateItem(
			courseClassListsToCreate,
			Models.CourseClassList,
			Object.keys(Models.CourseClassListAttributes)
		),
		getToCreateItem(courseClassesToCreate, Models.CourseClass, Object.keys(Models.CourseClassAttributes)),
		getToCreateItem(videosToCreate, Models.Video, Object.keys(Models.VideoAttributes)),
		getToCreateItem(videoQualitiesToCreate, Models.VideoQuality, Object.keys(Models.VideoQualityAttributes)),
		getToCreateItem(videoFormatsToCreate, Models.VideoFormat, Object.keys(Models.VideoFormatAttributes)),
		getToCreateItem(faqsToCreate, Models.FAQ, Object.keys(Models.FAQAttributes)),
	]) {
		i++;
		const log = toCreate.model === Models.FAQ;
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
		fs.writeFileSync(
			filePath,
			await stringify((entities as any[]).map(e => valuesFrom(e, toCreate.keys as any[])))
		);
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

	fs.writeFileSync(readVideosQualitiesFilePath, JSON.stringify({ readVideosQualities }));

	console.log("- done");
	process.exit(0);
})();
