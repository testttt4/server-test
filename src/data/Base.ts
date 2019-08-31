import * as Models from "../models";

import { Op } from "sequelize";
import moment from "moment";

// export type CacheType = {
// 	courses: Models.Course[];
// 	courseById: Map<number, Models.Course>;
// 	courseByCode: Map<string, Models.Course>;

// 	courseEditionById: Map<number, Models.CourseEdition[]>;
// 	courseEditionsByCourseId: Map<number, Models.CourseEdition[]>;

// 	courseClassListById: Map<number, Models.CourseClassList>;
// 	courseClassListsByCourseEditionId: Map<number, Models.CourseClassList[]>;

// 	courseClasses: Models.CourseClass[];
// 	courseClassById: Map<number, Models.CourseClass>;
// 	courseClassesByCourseClassListId: Map<number, Models.CourseClass[]>;

// 	faqs: Models.FAQ[];
// 	faqById: Map<number, Models.FAQ>;

// 	users: Models.User[];
// 	userById: Map<number, Models.User>;
// 	userByUid: Map<string, Models.User>;
// 	userRoleById: Map<number, Models.UserRole>;
// 	userRoleByName: Map<string, Models.UserRole>;
// 	userUserRolesByUserId: Map<number, Models.UserUserRole[]>;

// 	videos: Models.Video[];
// 	videoById: Map<number, Models.Video>;
// 	videosByCourseClassId: Map<number, Models.Video[]>;

// 	videoFormats: Models.VideoFormat[];
// 	videoFormatById: Map<number, Models.VideoFormat>;
// 	videoFormatsByVideoQualityId: Map<number, Models.VideoFormat[]>;

// 	videoQualities: Models.VideoQuality[];
// 	videoQualityById: Map<number, Models.VideoQuality>;
// 	videoQualitiesByVideoId: Map<number, Models.VideoQuality[]>;
// };

// let internalCache: CacheType | undefined;

export const getNotDeletedCondition = () => ({
	deletedAt: { [Op.or]: { [Op.eq]: null, [Op.gt]: moment().toDate() } },
});

// export const notDisabledCondition = { disabled: { [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: false }] } };

// export const getData = async (): Promise<CacheType> => {
// 	if (internalCache) return internalCache;

// 	const result = await new Promise<CacheType>(async resolve => {
// 		const notDeletedNorDisabledCondition = { [Op.and]: [getNotDeletedCondition(), notDisabledCondition] };

// 		const courses = ((await Models.Course.findAll()) as Models.Course[]).sort((c1, c2) =>
// 			c1.name && c2.name ? c1.name.localeCompare(c2.name) : c1.name === undefined ? -1 : 1
// 		);
// 		const publicCourses = courses.filter(c => c.status === Models.CourseStatus.Public);
// 		const courseClasses = await Models.CourseClass.findAll({
// 			where: notDeletedNorDisabledCondition,
// 		});
// 		const courseClassLists = await Models.CourseClassList.findAll({
// 			where: getNotDeletedCondition(),
// 		});
// 		const faqs = await Models.FAQ.findAll<Models.FAQ>({
// 			where: getNotDeletedCondition(),
// 		});
// 		const faqById = new Map<number, Models.FAQ>();
// 		faqs.forEach(faq => faqById.set(faq.id, faq));

// 		const users = await Models.User.findAll({
// 			where: getNotDeletedCondition(),
// 		});
// 		const userById = new Map<number, Models.User>();
// 		const userByUid = new Map<string, Models.User>();
// 		users.forEach(user => {
// 			userById.set(user.id, user);
// 			userByUid.set(user.uid, user);
// 		});

// 		const userRoles = await Models.UserRole.findAll();
// 		const userRoleById = new Map<number, Models.UserRole>();
// 		const userRoleByName = new Map<string, Models.UserRole>();
// 		userRoles.forEach(userRole => {
// 			userRoleById.set(userRole.id, userRole);
// 			userRoleByName.set(userRole.name, userRole);
// 		});

// 		const userUserRoles = await Models.UserUserRole.findAll({
// 			where: getNotDeletedCondition(),
// 		});
// 		const userUserRolesByUserId = new Map<number, Models.UserUserRole[]>();
// 		userUserRoles.forEach(userUserRole => {
// 			if (typeof userUserRole.userId !== "number") return;

// 			const userUserRolesArray = userUserRolesByUserId.get(userUserRole.userId);

// 			if (userUserRolesArray) userUserRolesArray.push(userUserRole);
// 			else userUserRolesByUserId.set(userUserRole.userId, [userUserRole]);
// 		});

// 		const videos = await Models.Video.findAll({
// 			where: getNotDeletedCondition(),
// 			order: [["position", "ASC"]],
// 		});
// 		const videoFormats = await Models.VideoFormat.findAll({
// 			where: getNotDeletedCondition(),
// 		});
// 		const videoQualities = await Models.VideoQuality.findAll({
// 			where: getNotDeletedCondition(),
// 		});

// 		const courseById = new Map<number, Models.Course>();
// 		courses.forEach(course => courseById.set(course.id, course));

// 		const courseByCode = new Map<string, Models.Course>();
// 		courses.forEach(course => courseByCode.set(course.code, course));

// 		let latestCourseClasses = courseClasses.slice();
// 		latestCourseClasses.sort((cc1, cc2) => {
// 			if (!cc1.createdAt) return 1;
// 			if (!cc2.createdAt) return -1;

// 			const moment1 = moment(cc1.createdAt);
// 			const moment2 = moment(cc2.createdAt);

// 			return moment1.isBefore(moment2) ? 1 : moment1.isAfter(moment2) ? -1 : 0;
// 		});
// 		latestCourseClasses = latestCourseClasses.slice(0, 20);

// 		const courseClassById = new Map<number, Models.CourseClass>();
// 		courseClasses.forEach(courseClass => courseClassById.set(courseClass.id, courseClass));

// 		const courseClassesByCourseClassListId = new Map<number, Models.CourseClass[]>();
// 		courseClassLists.forEach(courseClassList => {
// 			courseClassesByCourseClassListId.set(
// 				courseClassList.id,
// 				courseClasses
// 					.filter(courseClass => courseClass.courseClassListId === courseClassList.id)
// 					.sort((cc1, cc2) => (cc1.number < cc2.number ? -1 : cc1.number > cc2.number ? +1 : 0))
// 			);
// 		});

// 		const courseClassListById = new Map<number, Models.CourseClassList>();
// 		courseClassLists.forEach(courseClassList => courseClassListById.set(courseClassList.id, courseClassList));

// 		const courseClassListsByCourseId = new Map<number, Models.CourseClassList[]>();
// 		courses.forEach(course =>
// 			courseClassListsByCourseId.set(
// 				course.id,
// 				courseClassLists
// 					.filter(courseClassList => courseClassList.courseId === course.id)
// 					.sort((l1, l2) =>
// 						l1.createdAt
// 							? l2.createdAt
// 								? moment(l1.createdAt).isBefore(l2.createdAt)
// 									? -1
// 									: moment(l1.createdAt).isAfter(l2.createdAt)
// 									? 1
// 									: 0
// 								: -1
// 							: 1
// 					)
// 			)
// 		);

// 		const videoById = new Map<number, Models.Video>();
// 		videos.forEach(video => videoById.set(video.id, video));

// 		const videosByCourseClassId = new Map<number, Models.Video[]>();
// 		videos.forEach(video => {
// 			const videosArray = videosByCourseClassId.get(video.courseClassId);

// 			if (videosArray === undefined) videosByCourseClassId.set(video.courseClassId, [video]);
// 			else videosArray.push(video);
// 		});

// 		const videoFormatById = new Map<number, Models.VideoFormat>();
// 		videoFormats.forEach(videoFormat => videoFormatById.set(videoFormat.id, videoFormat));

// 		const videoFormatsByVideoQualityId = new Map<number, Models.VideoFormat[]>();
// 		videoFormats.forEach(videoFormat => {
// 			if (typeof videoFormat.videoQualityId !== "number") return;

// 			const videoFormatsArray = videoFormatsByVideoQualityId.get(videoFormat.videoQualityId);

// 			if (videoFormatsArray === undefined)
// 				videoFormatsByVideoQualityId.set(videoFormat.videoQualityId, [videoFormat]);
// 			else videoFormatsArray.push(videoFormat);
// 		});

// 		const videoQualityById = new Map<number, Models.VideoQuality>();
// 		videoQualities.forEach(videoQuality => videoQualityById.set(videoQuality.id, videoQuality));

// 		const videoQualitiesByVideoId = new Map<number, Models.VideoQuality[]>();
// 		videoQualities.forEach(videoQuality => {
// 			const videoQualitiesArray = videoQualitiesByVideoId.get(videoQuality.videoId);

// 			if (videoQualitiesArray === undefined) videoQualitiesByVideoId.set(videoQuality.videoId, [videoQuality]);
// 			else videoQualitiesArray.push(videoQuality);
// 		});

// 		resolve({
// 			courses,
// 			publicCourses,
// 			courseById,
// 			courseByCode,

// 			courseClasses,
// 			latestCourseClasses,
// 			courseClassById,
// 			courseClassesByCourseClassListId,

// 			courseClassLists,
// 			courseClassListById,
// 			courseClassListsByCourseId,

// 			faqs,
// 			faqById,

// 			users,
// 			userById,
// 			userByUid,
// 			userRoleById,
// 			userRoleByName,
// 			userUserRolesByUserId,

// 			videos,
// 			videoById,
// 			videosByCourseClassId,

// 			videoFormats,
// 			videoFormatById,
// 			videoFormatsByVideoQualityId,

// 			videoQualities,
// 			videoQualityById,
// 			videoQualitiesByVideoId,
// 		});
// 	});

// 	return (internalCache = result);
// };

// export const reloadCache = (): Promise<CacheType> => {
// 	internalCache = undefined;

// 	return getData();
// };

////////////////////////////////////////////

export type CacheData = {
	courses: Models.Course[];
	getCourseById: (id: number) => Models.Course | undefined;
	getCourseByCode: (code: string) => Models.Course | undefined;

	courseEditions: Models.CourseEdition[];
	getCourseEditionById: (id: number) => Models.CourseEdition | undefined;
	getCourseEditionsByCourseId: (id: number) => Models.CourseEdition[] | undefined;

	courseClassLists: Models.CourseClassList[];
	getCourseClassListById: (id: number) => Models.CourseClassList | undefined;
	getCourseClassListsByCourseEditionId: (id: number) => Models.CourseClassList[] | undefined;

	courseClasses: Models.CourseClass[];
	getCourseClassById: (id: number) => Models.CourseClass | undefined;
	getCourseClassesByCourseClassListId: (id: number) => Models.CourseClass[] | undefined;

	faqs: Models.FAQ[];
	getFaqById: (id: number) => Models.FAQ | undefined;

	users: Models.User[];
	getUserById: (id: number) => Models.User | undefined;
	getUserByUid: (uid: string) => Models.User | undefined;

	userRoles: Models.UserRole[];
	getUserRoleById: (id: number) => Models.UserRole | undefined;
	getUserRoleByName: (name: string) => Models.UserRole | undefined;

	userUserRoles: Models.UserUserRole[];
	getUserUserRolesByUserId: (id: number) => Models.UserUserRole[] | undefined;

	videos: Models.Video[];
	getVideoById: (id: number) => Models.Video | undefined;
	getVideosByCourseClassId: (id: number) => Models.Video[] | undefined;

	videoQualities: Models.VideoQuality[];
	getVideoQualityById: (id: number) => Models.VideoQuality | undefined;
	getVideoQualitiesByVideoId: (id: number) => Models.VideoQuality[] | undefined;

	videoFormats: Models.VideoFormat[];
	getVideoFormatById: (id: number) => Models.VideoFormat | undefined;
	getVideoFormatsByVideoQualityId: (id: number) => Models.VideoFormat[] | undefined;
};

// class CacheItem<T> {
// 	private map = new Map<keyof T, any>();

// 	public set<K extends keyof T>(key: K, value: T[K]) {
// 		this.map.set(key, value);
// 	}

// 	public get<K extends keyof T>(key: K): T[K] | undefined {
// 		return this.map.get(key);
// 	}

// 	public remove<K extends keyof T>(key: K) {
// 		this.map.delete(key);
// 	}
// }

export type CacheItem<T> = {
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	get: <K extends keyof T>(key: K) => T[K] | undefined;
	remove: <K extends keyof T>(key: K) => void;
};

export class Cache {
	private static data: CacheData | undefined;
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
		};

		this.items.push({ item: cacheItem, cleanInnerCache: () => (innerCache = new Map()) });

		return cacheItem;
	}

	public static async getData(): Promise<CacheData> {
		if (this.data) return this.data;

		const courses = await Models.Course.findAll({
			where: getNotDeletedCondition(),
		});
		const courseEditions = await Models.CourseEdition.findAll({
			where: getNotDeletedCondition(),
		});
		const courseClassLists = await Models.CourseClassList.findAll({
			where: getNotDeletedCondition(),
		});
		const courseClasses = await Models.CourseClass.findAll({
			where: getNotDeletedCondition(),
		});
		const faqs = await Models.FAQ.findAll({
			where: getNotDeletedCondition(),
		});
		const users = await Models.User.findAll({
			where: getNotDeletedCondition(),
		});
		const userRoles = await Models.UserRole.findAll({
			where: getNotDeletedCondition(),
		});
		const userUserRoles = await Models.UserUserRole.findAll({
			where: getNotDeletedCondition(),
		});
		const videos = await Models.Video.findAll({
			where: getNotDeletedCondition(),
		});
		const videoQualities = await Models.VideoQuality.findAll({
			where: getNotDeletedCondition(),
		});
		const videoFormats = await Models.VideoFormat.findAll({
			where: getNotDeletedCondition(),
		});

		const courseIndexById = courses.reduce(
			(map, course, index) => map.set(course.id, index),
			new Map<number, number>()
		);

		const courseIndexByCode = courses.reduce(
			(map, course, index) => map.set(course.code, index),
			new Map<string, number>()
		);

		const courseEditionIndexById = courseEditions.reduce(
			(map, courseEdition, index) => map.set(courseEdition.id, index),
			new Map<number, number>()
		);

		const courseEditionIndexesByCourseId = courseEditions.reduce(
			(map, courseEdition, index) =>
				map.set(
					courseEdition.id,
					map.has(courseEdition.courseId) ? [...map.get(courseEdition.courseId)!, index] : [index]
				),
			new Map<number, number[]>()
		);

		const courseClassListIndexById = courseClassLists.reduce(
			(map, courseClassList, index) => map.set(courseClassList.id, index),
			new Map<number, number>()
		);

		const courseClassListIndexesByCourseEditionId = courseClassLists.reduce(
			(map, courseClassList, index) =>
				map.set(
					courseClassList.id,
					map.has(courseClassList.courseEditionId)
						? [...map.get(courseClassList.courseEditionId)!, index]
						: [index]
				),
			new Map<number, number[]>()
		);

		const courseClassIndexById = courseClasses.reduce(
			(map, courseClass, index) => map.set(courseClass.id, index),
			new Map<number, number>()
		);

		const courseClassIndexesByCourseClassListId = courseClasses.reduce(
			(map, courseClass, index) =>
				map.set(
					courseClass.id,
					map.has(courseClass.courseClassListId)
						? [...map.get(courseClass.courseClassListId)!, index]
						: [index]
				),
			new Map<number, number[]>()
		);

		const faqIndexById = faqs.reduce((map, faq, index) => map.set(faq.id, index), new Map<number, number>());

		const userIndexById = users.reduce((map, user, index) => map.set(user.id, index), new Map<number, number>());

		const userIndexByUid = users.reduce((map, user, index) => map.set(user.uid, index), new Map<string, number>());

		const userRoleIndexById = userRoles.reduce(
			(map, userRole, index) => map.set(userRole.id, index),
			new Map<number, number>()
		);

		const userRoleIndexByName = userRoles.reduce(
			(map, userRole, index) => map.set(userRole.name, index),
			new Map<string, number>()
		);

		const userUserRoleIndexesByUserId = userUserRoles.reduce(
			(map, userUserRole, index) =>
				!userUserRole.userId
					? map
					: map.set(
							userUserRole.userId,
							map.has(userUserRole.userId) ? [...map.get(userUserRole.userId)!, index] : [index]
					  ),
			new Map<number, number[]>()
		);

		const videoIndexById = videos.reduce(
			(map, video, index) => map.set(video.id, index),
			new Map<number, number>()
		);
		const videoIndexesByCourseClassId = videos.reduce(
			(map, video, index) =>
				map.set(
					video.courseClassId,
					map.has(video.courseClassId) ? [...map.get(video.courseClassId)!, index] : [index]
				),
			new Map<number, number[]>()
		);

		const videoFormatIndexById = videoFormats.reduce(
			(map, videoFormat, index) => map.set(videoFormat.id, index),
			new Map<number, number>()
		);
		const videoFormatIndexesByVideoQualityId = videoFormats.reduce(
			(map, videoFormat, index) =>
				!videoFormat.videoQualityId
					? map
					: map.set(
							videoFormat.videoQualityId,
							map.has(videoFormat.videoQualityId)
								? [...map.get(videoFormat.videoQualityId)!, index]
								: [index]
					  ),
			new Map<number, number[]>()
		);

		const videoQualityIndexById = videoQualities.reduce(
			(map, videoQuality, index) => map.set(videoQuality.id, index),
			new Map<number, number>()
		);

		const videoQualityIndexesByVideoId = videoQualities.reduce(
			(map, videoQuality, index) =>
				map.set(
					videoQuality.videoId,
					map.has(videoQuality.videoId) ? [...map.get(videoQuality.videoId)!, index] : [index]
				),
			new Map<number, number[]>()
		);

		return {
			courses,
			getCourseById: id => {
				const index = courseIndexById.get(id);

				return typeof index === "number" ? courses[index] : undefined;
			},
			getCourseByCode: code => {
				const index = courseIndexByCode.get(code);

				return typeof index === "number" ? courses[index] : undefined;
			},

			courseEditions,
			getCourseEditionById: id => {
				const index = courseEditionIndexById.get(id);

				return typeof index === "number" ? courseEditions[index] : undefined;
			},
			getCourseEditionsByCourseId: id => {
				const indexes = courseEditionIndexesByCourseId.get(id);

				return indexes ? indexes.map(i => courseEditions[i]).filter(Boolean) : undefined;
			},

			courseClassLists,
			getCourseClassListById: id => {
				const index = courseClassListIndexById.get(id);

				return typeof index === "number" ? courseClassLists[index] : undefined;
			},
			getCourseClassListsByCourseEditionId: id => {
				const indexes = courseClassListIndexesByCourseEditionId.get(id);

				return indexes ? indexes.map(i => courseClassLists[i]).filter(Boolean) : undefined;
			},

			courseClasses,
			getCourseClassById: id => {
				const index = courseClassIndexById.get(id);

				return typeof index === "number" ? courseClasses[index] : undefined;
			},
			getCourseClassesByCourseClassListId: id => {
				const indexes = courseClassIndexesByCourseClassListId.get(id);

				return indexes ? indexes.map(i => courseClasses[i]).filter(Boolean) : undefined;
			},

			faqs,
			getFaqById: id => {
				const index = faqIndexById.get(id);

				return typeof index === "number" ? faqs[index] : undefined;
			},

			users,
			getUserById: id => {
				const index = userIndexById.get(id);

				return typeof index === "number" ? users[index] : undefined;
			},
			getUserByUid: uid => {
				const index = userIndexByUid.get(uid);

				return typeof index === "number" ? users[index] : undefined;
			},

			userRoles,
			getUserRoleById: id => {
				const index = userRoleIndexById.get(id);

				return typeof index === "number" ? userRoles[index] : undefined;
			},
			getUserRoleByName: name => {
				const index = userRoleIndexByName.get(name);

				return typeof index === "number" ? userRoles[index] : undefined;
			},

			userUserRoles,
			getUserUserRolesByUserId: id => {
				const indexes = userUserRoleIndexesByUserId.get(id);

				return indexes ? indexes.map(i => userUserRoles[i]).filter(Boolean) : undefined;
			},

			videos,
			getVideoById: id => {
				const index = videoIndexById.get(id);

				return typeof index === "number" ? videos[index] : undefined;
			},
			getVideosByCourseClassId: id => {
				const indexes = videoIndexesByCourseClassId.get(id);

				return indexes ? indexes.map(i => videos[i]).filter(Boolean) : undefined;
			},

			videoQualities,
			getVideoQualityById: id => {
				const index = videoQualityIndexById.get(id);

				return typeof index === "number" ? videoQualities[index] : undefined;
			},
			getVideoQualitiesByVideoId: id => {
				const indexes = videoQualityIndexesByVideoId.get(id);

				return indexes ? indexes.map(i => videoQualities[i]).filter(Boolean) : undefined;
			},

			videoFormats,
			getVideoFormatById: id => {
				const index = videoFormatIndexById.get(id);
				return typeof index === "number" ? videoFormats[index] : undefined;
			},
			getVideoFormatsByVideoQualityId: id => {
				const indexes = videoFormatIndexesByVideoQualityId.get(id);

				return indexes ? indexes.map(i => videoFormats[i]).filter(Boolean) : undefined;
			},
		};
	}

	public static resetCache() {
		const { items } = this;

		this.data = undefined;

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
		const shouldCalculate = getShouldCalculate ? getShouldCalculate(cacheItem, ...args) : !cachedData;
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
