import axios, { AxiosError } from "axios";

import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import fs from "fs";
import https from "https";
import { loadEnv } from "./loadEnv";
import path from "path";
import urlJoin from "url-join";

loadEnv();

// #region envs
const { env } = process;

if (!env.FILES_PATH) throw new Error("FILES_PATH not defined");
const FILES_PATH = path.join("/", ...env.FILES_PATH.split("/"));

const { FILES_URL } = env;
if (!FILES_URL) throw new Error("ASSETS_URL not defined");

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

const ASSETS_PATH = path.join(FILES_PATH, "assets");
const ASSETS_URL = urlJoin(FILES_URL, "assets");

const COURSE_ICONS_PATH = path.join(ASSETS_PATH, "course_icons");
const COURSE_ICONS_URL = urlJoin(ASSETS_URL, "course_icons");
// #endregion

let data: Record<
	string,
	{ prevUrl: string; newPath: string; newUrl: string } & ({ prevUrl: null; newPath: null } | {})
> = {};
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

	const filePath = path.join(__dirname, "..", "src", "scripts", "populateDB", "courseIconUrlByCode.ts");

	const isAxiosError = (response: any): response is AxiosError => "isAxiosError" in response && response.isAxiosError;

	if (!fs.existsSync(COURSE_ICONS_PATH)) fs.mkdirSync(COURSE_ICONS_PATH, { recursive: true });

	await Promise.all(
		readCourses.map(async readCourse => {
			const baseIconUrl:
				| string
				| undefined = `https://open.fing.edu.uy/Images/iconCourse/${readCourse.code}_image`;
			const posibilities = [`${baseIconUrl}.svg`];

			let iconUrl: string | undefined;
			for (const p of posibilities) {
				if (isAxiosError(await axios.head(p).catch(e => e))) continue;

				iconUrl = p;
				break;
			}

			let dataItem: { prevUrl: string; newPath: string; newUrl: string } & (
				| { prevUrl: undefined; newPath: undefined }
				| {});

			if (!iconUrl) {
				dataItem = {
					newUrl: urlJoin(COURSE_ICONS_URL, "default-icon.svg"),
					newPath: null,
					prevUrl: null,
				};
			} else {
				const iconUrlSplit = iconUrl.split(".");
				const newIconPath = path.join(
					COURSE_ICONS_PATH,
					`${readCourse.code}.${iconUrlSplit[iconUrlSplit.length - 1]}`
				);
				const newIconUrl = path.join(
					COURSE_ICONS_URL,
					`${readCourse.code}.${iconUrlSplit[iconUrlSplit.length - 1]}`
				);

				dataItem = {
					newPath: newIconPath,
					newUrl: newIconUrl,
					prevUrl: iconUrl,
				};
			}

			data[readCourse.code] = dataItem;
		})
	);

	fs.writeFileSync(
		filePath,
		`export const courseIconUrlByCode: Record<string, { prevUrl: string; newPath: string; newUrl: string } & ({ prevUrl: null; newPath: null } | {})> = ${JSON.stringify(
			data
		)};`
	);
})();
