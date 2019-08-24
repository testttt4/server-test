import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import fs from "fs";

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
		logging: false,
	});

	const updates: Array<{ code: string; name: string; number: string; title: string }> = (await readDB.query<{
		text: string;
		number: number | string;
		code: string;
		name: string;
	}>(
		`select text, number, code, name from videos left join titles on titles.video_id = videos.id left join courses on courses.id = videos.course_id where not(disabled) and code!='vyo19' order by videos.created_at desc limit 10;`,
		{
			type: QueryTypes.SELECT,
		}
	)).map(u => ({
		code: u.code,
		name: u.name,
		number: u.number.toString(),
		title: u.text,
	}));

	fs.writeFileSync("/home/openfing/openfing/data/Updates.json", JSON.stringify({ updates }));
	console.log("Actualizaciones generadas.");

	process.exit(0);
})();
