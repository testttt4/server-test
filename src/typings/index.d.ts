declare type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer U>
		? Array<RecursivePartial<U>>
		: T[P] extends object
		? RecursivePartial<T[P]>
		: T[P];
};

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// TODO: delete?
declare module "graphql-upload" {
	import { ReadStream } from "fs";

	export type FileUpload = Promise<{
		filename: string;
		mimetype: string;
		encoding: string;
		createReadStream: () => ReadStream;
	}>;
}
