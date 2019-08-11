import * as path from "path";

import urlJoin from "url-join";

const { env } = process;
const { FILES_URL, JWT_DURATION, JWT_SECRET, DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = env;

if (!env.FILES_PATH) throw new Error("FILES_PATH not defined");
const FILES_PATH = path.join(...env.FILES_PATH.split("/"));

if (!FILES_URL) throw new Error("ASSETS_URL not defined");

if (!JWT_SECRET) throw new Error("JWT_SECRET variable not defined");
if (!JWT_DURATION) throw new Error("JWT_DURATION variable not defined");

const HOST = env.HOST || "localhost";
if (!env.HOST) console.log(`Using default HOST: \`${HOST}\``);

if (!env.PORT) throw new Error("PORT variable not defined");
const PORT = Number(env.PORT);
if (!PORT) throw new Error("Invalid PORT value. Must be number");

if (!DB_HOST) throw new Error("DB_HOST variable not defined");

if (!env.DB_PORT) throw new Error("DB_PORT variable not defined");
const DB_PORT = Number(env.DB_PORT);
if (!DB_PORT) throw new Error("Invalid DB_PORT value. Must be number");

if (!DB_NAME) throw new Error("DB_NAME variable not defined");
if (!DB_USERNAME) throw new Error("DB_USERNAME variable not defined");
if (!DB_PASSWORD) throw new Error("DB_PASSWORD variable not defined");

const ASSETS_PATH = path.join(FILES_PATH, "assets");
const ASSETS_URL = urlJoin(FILES_URL, "assets");

const COURSE_ICONS_PATH = path.join(ASSETS_PATH, "course_icons");
const COURSE_ICONS_URL = urlJoin(ASSETS_URL, "course_icons");

export const serverConfig = {
	FILES_PATH,
	FILES_URL,

	ASSETS_PATH,
	ASSETS_URL,

	COURSE_ICONS_PATH,
	COURSE_ICONS_URL,

	DEFAULT_COURSE_ICON_FILE_PATH: path.join(COURSE_ICONS_PATH, "default-icon.svg"),
	DEFAULT_COURSE_ICON_URL: urlJoin(COURSE_ICONS_URL, "default-icon.svg"),

	JWT_SECRET,
	JWT_DURATION,

	HOST,
	PORT,

	DB_HOST,
	DB_PORT,
	DB_NAME,
	DB_USERNAME,
	DB_PASSWORD,

	LOGGER_PATH: path.resolve(__dirname, "logs"),
};
