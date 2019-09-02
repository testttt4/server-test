import * as fs from "fs";
import * as path from "path";

import SFTP from "ssh2-promise/dist/sftp";
import SSH2Promise from "ssh2-promise";
import { loadEnv } from "./loadEnv";
import { projectPath } from "../config/projectPath";

loadEnv();

const deploy = async () => {
	const { SSH_KEY, DESTINATION_PATH, SSH_HOST, SSH_USERNAME, DELETE_DIR_FIRST, PM2_PROCESS_NAME } = process.env;

	if (!SSH_KEY) throw new Error("No valid ssh key found");
	if (!DESTINATION_PATH) throw new Error("No valid destination path defined");
	if (!SSH_HOST) throw new Error("No valid ssh host defined");
	if (!SSH_USERNAME) throw new Error("No valid ssh username path defined");
	if (!PM2_PROCESS_NAME) throw new Error("No valid pm2 process name defined");

	const uploadRecursive = async (options: { fromPath: string; toPath: string; sftp: SFTP }) => {
		const { fromPath, toPath, sftp } = options;
		const isDirectory = fs.lstatSync(fromPath).isDirectory();

		if (!isDirectory) {
			await new Promise(async (resolve, reject) => {
				const readStream = fs.createReadStream(fromPath);
				const writeStream = await sftp.createWriteStream(toPath);

				writeStream.on("close", () => resolve());
				writeStream.on("error", reject);

				readStream.pipe(writeStream);
			});
		} else {
			let shouldCreateFolder = true;

			try {
				const lsStat = await sftp.lstat(toPath);

				if (!lsStat.isDirectory()) await sftp.unlink(toPath);
				else shouldCreateFolder = false;
			} catch (e) {}

			if (shouldCreateFolder) await sftp.mkdir(toPath);

			const folderContent = fs.readdirSync(fromPath);

			for (const item of folderContent)
				await uploadRecursive({
					fromPath: path.join(fromPath, item),
					toPath: path.join(toPath, item),
					sftp,
				});
		}

		console.log(`- uploaded: ${fromPath} to ${toPath}`);
	};

	const ssh = new SSH2Promise({
		host: SSH_HOST,
		username: SSH_USERNAME,
		privateKey: Buffer.from(SSH_KEY, "base64"),
	});

	await ssh.connect();
	const sftp = ssh.sftp();

	const shouldDeleteDestinationPath = DELETE_DIR_FIRST === "true";

	console.log(shouldDeleteDestinationPath ? `Will delete ${DESTINATION_PATH}` : `Won't delete ${DESTINATION_PATH}`);

	try {
		console.log(
			await ssh.exec(
				[
					`pm2 stop ${PM2_PROCESS_NAME}`,
					`pm2 delete ${PM2_PROCESS_NAME}`,
					shouldDeleteDestinationPath && `rm -rf ${DESTINATION_PATH}`,
					`mkdir -p ${DESTINATION_PATH}`,
				]
					.filter(Boolean)
					.join("; ")
			)
		);
	} catch (e) {
		console.log(e.toString("utf8"));
	}

	const pm2Config = {
		apps: [
			{
				name: PM2_PROCESS_NAME,
				script: "index.js",
			},
		],
	};
	const pm2ConfigFilename = "pm2config.json";
	const pm2ConfigPath = path.resolve(projectPath, pm2ConfigFilename);
	await fs.writeFileSync(pm2ConfigPath, JSON.stringify(pm2Config));

	await uploadRecursive({
		fromPath: path.join(projectPath, "dist"),
		toPath: path.join(DESTINATION_PATH),
		sftp,
	});

	await uploadRecursive({
		fromPath: pm2ConfigPath,
		toPath: path.join(DESTINATION_PATH, pm2ConfigFilename),
		sftp,
	});

	await uploadRecursive({
		fromPath: "package.json",
		toPath: path.join(DESTINATION_PATH, "package.json"),
		sftp,
	});

	await uploadRecursive({
		fromPath: "package-lock.json",
		toPath: path.join(DESTINATION_PATH, "package-lock.json"),
		sftp,
	});

	for (const command of [
		"npm ci",
		`node ${path.join(DESTINATION_PATH, "scripts", "populateDB.js")}`,
		`pm2 start ${pm2ConfigFilename}`,
	]) {
		console.log(command);

		try {
			console.log(await ssh.exec("pwd"));
		} catch (e) {
			console.log(e.toString("utf8"));
		}

		try {
			console.log(await ssh.exec([`cd ${DESTINATION_PATH}`, command].join(" && ")));
		} catch (e) {
			console.log(e.toString("utf8"));
		}
	}

	console.log("- done");
	ssh.close();
};

deploy().catch(e => {
	console.log(e);
	process.exit(1);
});
