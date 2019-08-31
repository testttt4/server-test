/// <reference path="../src/typings/inline-environment-variables-webpack-plugin.d.ts" />

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import InlineEnvironmentVariablesPlugin from "inline-environment-variables-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import nodeExternals from "webpack-node-externals";
import path from "path";
import { projectPath } from "./projectPath";
import webpack from "webpack";

const babelConfig = {
	presets: [
		[
			"@babel/env",
			{
				targets: {
					node: "6",
				},
			},
		],
	],
	plugins: [
		[
			"@babel/plugin-transform-runtime",
			{
				absoluteRuntime: false,
				corejs: 3,
				helpers: true,
				regenerator: true,
				useESModules: false,
			},
		],
		["@babel/plugin-proposal-decorators", { legacy: true }],
		["@babel/proposal-class-properties", { loose: true }],
		"@babel/proposal-object-rest-spread",
	],
};

export const webpackConfigFactory = (env: "development" | "production" | "none"): webpack.Configuration => {
	const outputPath = path.resolve(projectPath, "dist");

	const isProd = env === "production";

	const minimizer = [];

	// if (isProd)
	// 	minimizer.push(
	// 		new TerserPlugin({
	// 			sourceMap: true,
	// 			extractComments: "all",
	// 			terserOptions: {
	// 				compress: {
	// 					drop_console: false,
	// 					keep_fnames: true,
	// 					keep_classnames: true,
	// 				},
	// 			},
	// 		})
	// 	);

	const plugins = [
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.optimize.OccurrenceOrderPlugin(false),
		new InlineEnvironmentVariablesPlugin(),
		new webpack.EnvironmentPlugin(process.env),
	];

	if (isProd) plugins.push(new CleanWebpackPlugin());

	return {
		mode: env,
		entry: {
			index: path.resolve(projectPath, "src", "index.ts"),
			[path.join("scripts", "populateDB")]: path.resolve(
				projectPath,
				"src",
				"scripts",
				"populateDB",
				"populateDB.ts"
			),
			[path.join("scripts", "computeUpdates")]: path.resolve(projectPath, "src", "scripts", "computeUpdates"),
		},
		output: {
			path: outputPath,
			publicPath: "/",
			filename: "[name].js",
		},
		target: "node",
		node: {
			// Need this when working with express, otherwise the build fails
			__dirname: false, // if you don't put this is, __dirname
			__filename: false, // and __filename return blank or /
		},
		externals: [nodeExternals()], // Need this to avoid error when working with Express
		module: {
			rules: [
				{
					// Transpiles ES6-8 into ES5
					test: /\.[jt]s$/,
					exclude: /node_modules/,
					use: [
						{
							loader: "babel-loader",
							options: {
								cacheDirectory: true,
								...babelConfig,
							},
						},
						{
							loader: "ts-loader",
							options: {
								transpileOnly: true,
								onlyCompileBundledFiles: true,
							},
						},
					],
				},
			],
		},
		resolve: {
			extensions: [".ts", ".tsx", ".js", ".json"],
			plugins: [new TsconfigPathsPlugin()],
		},
		plugins,
		optimization: {
			minimizer,
		},
		stats: {
			warningsFilter: /export .* was not found in/,
		},
		devtool: "source-map",
	};
};
