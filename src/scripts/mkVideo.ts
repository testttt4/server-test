import * as Models from "../models";

import { Sequelize } from "sequelize-typescript";
import commandLineArgs from "command-line-args";
import ffprobe from "ffprobe";
import ffprobeStatic from "ffprobe-static";
import { identity } from "../utils/Helper";
import moment from "moment";

const { env } = process;

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

const options = commandLineArgs([
	{
		alias: "c",
		type: String,
		name: "courseCode",
	},
	{
		alias: "n",
		type: Number,
		name: "classNo",
	},
	{
		alias: "t",
		type: String,
		name: "classTitle",
	},
]);
let { courseCode, classNo, classTitle } = options;

if (typeof courseCode !== "string" || !courseCode) throw new Error("No se especificó un codigo de curso.");
if (typeof classNo !== "number" || !classNo) throw new Error("No se especificó un número de clase.");
if (typeof classTitle !== "string" || !classTitle) classTitle = `Clase ${classNo}`;

(async () => {
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

	const userId = 1;
	const createdAt = moment().toDate();

	const getCleanReadCourseCode = (code: string): [string, number | null] => {
		let regex = /-?\d{4}$/;
		let match = code.match(regex);

		if (match) {
			const year = parseInt(match[0].replace(/\D/g, ""));

			if (!isNaN(year)) return [code.replace(regex, ""), year];
		}

		regex = /-?\d{2}$/;
		match = code.match(regex);

		if (match) {
			const year = parseInt(match[0].replace(/\D/g, ""));

			if (!isNaN(year)) return [code.replace(regex, ""), year + 2000];
		}

		return [code, null];
	};

	const [cleanCode, year] = getCleanReadCourseCode(courseCode);

	const course = await Models.Course.findOne({
		where: {
			[Models.CourseAttributes.code]: cleanCode,
		},
	});

	if (!course) throw new Error(`No se encontró curso con codigo ${cleanCode} (${courseCode})`);

	const courseEditionWhere = {
		[Models.CourseEditionAttributes.courseId]: course.id,
	};

	if (year) courseEditionWhere[Models.CourseEditionAttributes.year] = year;

	const courseEditions = await Models.CourseEdition.findAll({
		where: courseEditionWhere,
	});

	if (courseEditions.length !== 1) throw new Error("No se pudo encontrar la edición del curso correcta.");
	const courseEdition = courseEditions[0];

	const courseClassLists = await Models.CourseClassList.findAll({
		where: {
			[Models.CourseClassListAttributes.courseEditionId]: courseEdition.id,
		},
	});

	if (courseClassLists.length !== 1) throw new Error("No se pudo encontrar la lista de clases correcta.");
	const courseClassList = courseClassLists[0];

	const courseClasses = await Models.CourseClass.findAll({
		where: {
			[Models.CourseClassAttributes.courseClassListId]: courseClassList.id,
			[Models.CourseClassAttributes.number]: classNo,
		},
	});
	let courseClass = courseClasses[0];

	if (courseClass) throw new Error(`Ya existe una clase con numero ${classNo}`);

	courseClass = await new Models.CourseClass(
		identity<Required<Pick<Models.CourseClass, keyof Omit<typeof Models.CourseClassAttributes, "id">>>>({
			courseClassListId: courseClassList.id,
			createdAt: moment().toDate(),
			createdById: 1,
			deletedAt: null,
			deletedById: null,
			disabled: false,
			number: classNo,
			title: classTitle,
			updatedAt: moment().toDate(),
			updatedById: 1,
		})
	);

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

	const qualities: Array<{
		width: number;
		height: number;
		formats: Array<{
			name: string;
			url: string;
		}>;
	}> = [];

	const baseUrl = `http://openfing-video.fing.edu.uy/media/${courseCode}/${courseCode}_${
		classNo < 10 ? `0${classNo}` : classNo
	}`;

	const tryFormatName = async (formatName: string) => {
		const url = `${baseUrl}.${formatName}`;
		let videoResolution = await getVideoResolution(url);

		if (videoResolution) {
			const { height, width } = videoResolution;

			const quality = qualities.find(q => q.height === height);

			if (!quality)
				qualities.push({
					height,
					width,
					formats: [{ name: formatName, url }],
				});
			else quality.formats.push({ name: formatName, url });
		}
	};

	await tryFormatName("webm");
	await tryFormatName("mp4");

	if (qualities.length === 0) throw new Error("No se encontró ningun video de la clase.");

	await courseClass.save();

	const video = await new Models.Video({
		courseClassId: courseClass.id,
		createdAt,
		createdById: userId,
		deletedAt: null,
		deletedById: null,
		name: `Clase`,
		position: 1,
		updatedAt: createdAt,
		updatedById: userId,
	}).save();

	for (const quality of qualities) {
		const { width, height, formats } = quality;

		const videoQuality = await new Models.VideoQuality({
			height,
			width,
			createdAt: moment().toDate(),
			createdById: 1,
			updatedAt: moment().toDate(),
			updatedById: 1,
			deletedAt: null,
			deletedById: null,
			videoId: video.id,
		}).save();

		for (const format of formats) {
			const { name, url } = format;

			await new Models.VideoFormat({
				name,
				url,
				videoQualityId: videoQuality.id,
				createdAt: moment().toDate(),
				createdById: 1,
				updatedAt: moment().toDate(),
				updatedById: 1,
				deletedAt: null,
				deletedById: null,
			});
		}
	}

	console.log(`Se creó la clase con id ${courseClass.id}`);
	process.exit(0);
})().catch(console.error);
