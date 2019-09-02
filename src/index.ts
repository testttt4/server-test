import "core-js/stable";
import "moment-timezone";
import "reflect-metadata";
import "regenerator-runtime/runtime";

import * as Models from "./models";
import * as Resolvers from "./resolvers";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";

import { Context } from "./Context";
import { ContextFunction } from "apollo-server-core";
import { CustomApolloServer } from "./CustomApolloServer";
import { CustomSequelize } from "./CustomSequelize";
import { buildSchemaSync } from "type-graphql";
import cors from "cors";
import express from "express";
import { formatError } from "apollo-errors";
import { logger } from "./utils/logger";
import { serverConfig } from "./serverConfig";

const sequelize = new CustomSequelize({
	database: serverConfig.DB_NAME,
	port: serverConfig.DB_PORT,
	dialect: "postgres",
	username: serverConfig.DB_USERNAME,
	password: serverConfig.DB_PASSWORD,
	host: serverConfig.DB_HOST,
	define: {
		freezeTableName: true,
		schema: "openfing",
	},
});

setInterval(() => {
	const used = process.memoryUsage().heapUsed / 1024 / 1024;

	console.log(`${Math.round(used * 100) / 100} MB`);
}, 5000);

const expressApp = express();

const schema = buildSchemaSync({
	resolvers: [
		Resolvers.Course,
		Resolvers.CourseClass,
		Resolvers.CourseClassList,
		Resolvers.CourseEdition,
		Resolvers.FAQ,
		Resolvers.User,
		Resolvers.Utils,
		Resolvers.Video,
		Resolvers.VideoFormat,
		Resolvers.VideoQuality,
	],
	validate: false,
});

const context: ContextFunction<Context> = async context => {
	let me: { id: number } | undefined;
	const token = context.req.headers["x-token"];

	if (typeof token === "string")
		try {
			const payload = jwt.verify(token, serverConfig.JWT_SECRET);

			if (typeof payload === "object") {
				const { id } = payload as any;

				if (typeof id === "number") me = { id };
			}
		} catch (e) {
			/**/
		}

	const newContext: Context = {
		...context,
		me,
	};

	return newContext;
};

const apolloServer = new CustomApolloServer({
	playground: true,
	debug: process.env.NODE_ENV === "development",
	formatError: e => {
		logger.error(e);

		return formatError(e) as any;
	},
	formatResponse: (r: string) => {
		logger.debug(r);

		return r;
	},
	schema: schema,
	context,
	uploads: {
		maxFileSize: 10000000,
	},
});

expressApp.use(cors());
logger.info("cors added");

apolloServer.applyMiddleware({ app: expressApp, path: `/v1/graphql` });

if (!fs.existsSync(serverConfig.COURSE_ICONS_PATH)) fs.mkdirSync(serverConfig.COURSE_ICONS_PATH, { recursive: true });

if (!fs.existsSync(serverConfig.LOGGER_PATH)) fs.mkdirSync(serverConfig.LOGGER_PATH, { recursive: true });

expressApp.listen(
	{
		port: serverConfig.PORT,
		host: serverConfig.HOST,
	},
	() => {
		logger.info(`Listening on port ${serverConfig.PORT} with cors enabled`);
		sequelize.addModels([
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
		sequelize.query("CREATE SCHEMA IF NOT EXISTS openfing");
		sequelize.sync({});
	}
);
