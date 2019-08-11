declare module "ffprobe" {
	const getInfo: (
		filePath: string,
		opts: { path: string }
	) => Promise<{ streams: [{ height: number; width: number }] }>;
	export = getInfo;
}
