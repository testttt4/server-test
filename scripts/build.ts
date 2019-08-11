import { loadEnv } from "./loadEnv";
import webpack from "webpack";
import { webpackConfigFactory } from "../config/webpack.config";

loadEnv();

const handler: webpack.Compiler.Handler = (err, stats) => {
	if (err) console.error(err);
	if (stats) console.log(stats.toString({ colors: true }));
};

webpack(webpackConfigFactory("production"), handler);
