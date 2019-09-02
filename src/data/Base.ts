import { Op } from "sequelize";
import moment from "moment";

export const getNotDeletedCondition = () => ({
	deletedAt: { [Op.or]: { [Op.eq]: null, [Op.gt]: moment().toDate() } },
});

export type CacheItem<T> = {
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	get: <K extends keyof T>(key: K) => T[K] | undefined;
	has: <K extends keyof T>(key: K) => boolean;
	remove: <K extends keyof T>(key: K) => void;
};

export class Cache {
	private static items: Array<{ item: CacheItem<any>; cleanInnerCache: () => void }> = [];

	public static createItem<T>(): CacheItem<T> {
		let innerCache = new Map<keyof T, any>();

		const cacheItem: CacheItem<T> = {
			set: (key, value) => {
				innerCache.set(key, value);
			},
			get: key => innerCache.get(key),
			remove: key => {
				innerCache.delete(key);
			},
			has: key => innerCache.has(key),
		};

		this.items.push({ item: cacheItem, cleanInnerCache: () => (innerCache = new Map()) });

		return cacheItem;
	}

	public static removeCache() {
		const { items } = this;

		items.forEach(i => i.cleanInnerCache());
	}
}

export const getDataHandler = <T extends (...args: any[]) => any>(params: {
	getCacheKey: (...params: Parameters<T>) => string;
	getShouldCalculate?: (cacheItem: CacheItem<any>, ...params: Parameters<T>) => boolean;
	calculate: (config: { ignore: () => void }, ...params: Parameters<T>) => ReturnType<T>;
}): T => {
	const cacheItem = Cache.createItem<any>();

	return (async (...args: Parameters<T>) => {
		const { getCacheKey, getShouldCalculate, calculate } = params;

		const cacheKey = getCacheKey(...args);
		const cachedData = cacheItem.get(cacheKey);
		const shouldCalculate = getShouldCalculate ? getShouldCalculate(cacheItem, ...args) : !cacheItem.has(cacheKey);
		let shouldSave = true;

		if (shouldCalculate) {
			const result = await calculate(
				{
					ignore: () => {
						shouldSave = false;
					},
				},
				...args
			);

			if (shouldSave) cacheItem.set(cacheKey, result);

			return result;
		}

		return cachedData;
	}) as T;
};
