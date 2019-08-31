import * as fs from "fs";
import * as path from "path";

import { parse } from "dotenv";
import { projectPath } from "../config/projectPath";

export const decodeEnvFile = (envFile: string): Record<string, string> =>
	parse(Buffer.from(envFile, "base64").toString());

export const loadEnv = () => {
	const { CI, TRAVIS_TAG, ENV_FILE = ".env" } = process.env;

	const envFilePath = path.resolve(projectPath, ENV_FILE);

	if (!fs.existsSync(envFilePath)) return console.log(`${ENV_FILE} file not found. Skiping loadEnv.`);

	const envFileData = fs.readFileSync(envFilePath, "utf8");

	const envs = parse(envFileData);

	process.env = {
		...process.env,
		...envs,
	};

	if (CI === "true") {
		const isPreview = TRAVIS_TAG && /^v\d+\.\d+\.\d+-preview\d+$/.test(TRAVIS_TAG);
		const isProduction = TRAVIS_TAG && /^v\d+\.\d+\.\d+$/.test(TRAVIS_TAG);

		if (!isPreview && !isProduction) return console.log("Won't be deploying.");

		const { ENV_PREVIEW_FILE, ENV_PRODUCTION_FILE } = process.env;

		if (isPreview && ENV_PREVIEW_FILE)
			process.env = {
				...process.env,
				...decodeEnvFile(ENV_PREVIEW_FILE),
			};

		if (isProduction && ENV_PRODUCTION_FILE)
			process.env = {
				...process.env,
				...decodeEnvFile(ENV_PRODUCTION_FILE),
			};
	}
};
