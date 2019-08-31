import "core-js/stable";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "../src/models";

import { Op } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { loadEnv } from "./loadEnv";
import moment from "moment";

loadEnv();

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

export const getNotDeletedCondition = () => ({
	deletedAt: { [Op.or]: { [Op.eq]: null, [Op.gt]: moment().toDate() } },
});

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
		Models.CourseEdition,
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

	const options: { includeDeleted?: boolean; includeDisabled?: boolean } = {};

	console.log(
		(await Models.UserRole.findAll({
			logging: console.log,
			include: [
				{
					model: Models.User,
					attributes: [Models.UserAttributes.name],
					where: {},
				},
			],
		})).map(e => e.users.map(u => u.name))
	);

	process.exit(0);
})();
