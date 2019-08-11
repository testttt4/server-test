declare module "inline-environment-variables-webpack-plugin" {
	import { Plugin } from "webpack";

	declare class InlineEnvironmentVariablesPlugin extends Plugin {
		public constructor();
		public constructor(variable: string, options?: InlineEnvironmentVariablesPluginOptions);
		public constructor(variables: Record<string, string>, options?: InlineEnvironmentVariablesPluginOptions);
		public constructor(
			variables: Array<string | Record<string, string>>,
			options?: InlineEnvironmentVariablesPluginOptions
		);
	}

	declare namespace InlineEnvironmentVariablesPlugin {
		type InlineEnvironmentVariablesPluginOptions = {
			warnings: boolean;
		};
	}

	export = InlineEnvironmentVariablesPlugin;
}
