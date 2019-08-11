import * as fs from "fs";
import * as path from "path";

import { createLogger, format, transports } from "winston";

import { serverConfig } from "../serverConfig";

const logsPath = serverConfig.LOGGER_PATH;
if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath);

export const logger = createLogger({
	format: format.combine(
		format.simple(),
		format.timestamp(),
		format.printf(info => `[${info.timestamp}] ${info.level} ${info.message}`)
	),
	transports: [
		new transports.File({
			filename: path.join(logsPath, "api.log"),
			maxFiles: 5,
			maxsize: 5120000,
		}),
		new transports.Console({
			level: "debug",
		}),
	],
});
