import * as Models from "../models";

import { Op } from "sequelize";
import moment from "moment";

export type CacheType = {
	courses: Models.Course[];
	courseById: Map<number, Models.Course>;
	courseByCode: Map<string, Models.Course>;

	courseClasses: Models.CourseClass[];
	latestCourseClasses: Models.CourseClass[];
	courseClassById: Map<number, Models.CourseClass>;
	courseClassesByCourseClassListId: Map<number, Models.CourseClass[]>;

	courseClassLists: Models.CourseClassList[];
	courseClassListById: Map<number, Models.CourseClassList>;
	courseClassListsByCourseId: Map<number, Models.CourseClassList[]>;

	faqs: Models.FAQ[];
	faqById: Map<number, Models.FAQ>;

	users: Models.User[];
	userById: Map<number, Models.User>;
	userByUid: Map<string, Models.User>;
	userRoleById: Map<number, Models.UserRole>;
	userRoleByName: Map<string, Models.UserRole>;
	userUserRolesByUserId: Map<number, Models.UserUserRole[]>;

	videos: Models.Video[];
	videoById: Map<number, Models.Video>;
	videosByCourseClassId: Map<number, Models.Video[]>;

	videoFormats: Models.VideoFormat[];
	videoFormatById: Map<number, Models.VideoFormat>;
	videoFormatsByVideoQualityId: Map<number, Models.VideoFormat[]>;

	videoQualities: Models.VideoQuality[];
	videoQualityById: Map<number, Models.VideoQuality>;
	videoQualitiesByVideoId: Map<number, Models.VideoQuality[]>;
};

let internalCache: CacheType | undefined;

export const getNotDeletedCondition = () => {
	return { deletedAt: { [Op.or]: { [Op.eq]: null, [Op.gt]: moment().toDate() } } };
};

export const notDisabledCondition = { disabled: { [Op.or]: [{ [Op.eq]: null }, { [Op.eq]: false }] } };

export const getData = async (): Promise<CacheType> => {
	if (internalCache) return internalCache;

	const result = await new Promise<CacheType>(async resolve => {
		const notDeletedNorDisabledCondition = { [Op.and]: [getNotDeletedCondition(), notDisabledCondition] };

		const courses = ((await Models.Course.findAll({
			where: notDeletedNorDisabledCondition,
		})) as Models.Course[]).sort((c1, c2) =>
			c1.name && c2.name ? c1.name.localeCompare(c2.name) : c1.name === undefined ? -1 : 1
		);
		const courseClasses = await Models.CourseClass.findAll({
			where: notDeletedNorDisabledCondition,
		});
		const courseClassLists = await Models.CourseClassList.findAll({
			where: getNotDeletedCondition(),
		});
		const faqs = await Models.FAQ.findAll<Models.FAQ>({
			where: getNotDeletedCondition(),
		});
		const faqById = new Map<number, Models.FAQ>();
		faqs.forEach(faq => faqById.set(faq.id, faq));

		const users = await Models.User.findAll({
			where: getNotDeletedCondition(),
		});
		const userById = new Map<number, Models.User>();
		const userByUid = new Map<string, Models.User>();
		users.forEach(user => {
			userById.set(user.id, user);
			userByUid.set(user.uid, user);
		});

		const userRoles = await Models.UserRole.findAll();
		const userRoleById = new Map<number, Models.UserRole>();
		const userRoleByName = new Map<string, Models.UserRole>();
		userRoles.forEach(userRole => {
			userRoleById.set(userRole.id, userRole);
			userRoleByName.set(userRole.name, userRole);
		});

		const userUserRoles = await Models.UserUserRole.findAll({
			where: getNotDeletedCondition(),
		});
		const userUserRolesByUserId = new Map<number, Models.UserUserRole[]>();
		userUserRoles.forEach(userUserRole => {
			if (typeof userUserRole.userId !== "number") return;

			const userUserRolesArray = userUserRolesByUserId.get(userUserRole.userId);

			if (userUserRolesArray) userUserRolesArray.push(userUserRole);
			else userUserRolesByUserId.set(userUserRole.userId, [userUserRole]);
		});

		const videos = await Models.Video.findAll({
			where: getNotDeletedCondition(),
			order: [["position", "ASC"]],
		});
		const videoFormats = await Models.VideoFormat.findAll({
			where: getNotDeletedCondition(),
		});
		const videoQualities = await Models.VideoQuality.findAll({
			where: getNotDeletedCondition(),
		});

		const courseById = new Map<number, Models.Course>();
		courses.forEach(course => courseById.set(course.id, course));

		const courseByCode = new Map<string, Models.Course>();
		courses.forEach(course => courseByCode.set(course.code, course));

		let latestCourseClasses = courseClasses.slice();
		latestCourseClasses.sort((cc1, cc2) => {
			if (!cc1.createdAt) return 1;
			if (!cc2.createdAt) return -1;

			const moment1 = moment(cc1.createdAt);
			const moment2 = moment(cc2.createdAt);

			return moment1.isBefore(moment2) ? 1 : moment1.isAfter(moment2) ? -1 : 0;
		});
		latestCourseClasses = latestCourseClasses.slice(0, 20);

		const courseClassById = new Map<number, Models.CourseClass>();
		courseClasses.forEach(courseClass => courseClassById.set(courseClass.id, courseClass));

		const courseClassesByCourseClassListId = new Map<number, Models.CourseClass[]>();
		courseClassLists.forEach(courseClassList => {
			courseClassesByCourseClassListId.set(
				courseClassList.id,
				courseClasses
					.filter(courseClass => courseClass.courseClassListId === courseClassList.id)
					.sort((cc1, cc2) => (cc1.number < cc2.number ? -1 : cc1.number > cc2.number ? +1 : 0))
			);
		});

		const courseClassListById = new Map<number, Models.CourseClassList>();
		courseClassLists.forEach(courseClassList => courseClassListById.set(courseClassList.id, courseClassList));

		const courseClassListsByCourseId = new Map<number, Models.CourseClassList[]>();
		courses.forEach(course =>
			courseClassListsByCourseId.set(
				course.id,
				courseClassLists
					.filter(courseClassList => courseClassList.courseId === course.id)
					.sort((l1, l2) =>
						l1.createdAt
							? l2.createdAt
								? moment(l1.createdAt).isBefore(l2.createdAt)
									? -1
									: moment(l1.createdAt).isAfter(l2.createdAt)
									? 1
									: 0
								: -1
							: 1
					)
			)
		);

		const videoById = new Map<number, Models.Video>();
		videos.forEach(video => videoById.set(video.id, video));

		const videosByCourseClassId = new Map<number, Models.Video[]>();
		videos.forEach(video => {
			const videosArray = videosByCourseClassId.get(video.courseClassId);

			if (videosArray === undefined) videosByCourseClassId.set(video.courseClassId, [video]);
			else videosArray.push(video);
		});

		const videoFormatById = new Map<number, Models.VideoFormat>();
		videoFormats.forEach(videoFormat => videoFormatById.set(videoFormat.id, videoFormat));

		const videoFormatsByVideoQualityId = new Map<number, Models.VideoFormat[]>();
		videoFormats.forEach(videoFormat => {
			if (typeof videoFormat.videoQualityId !== "number") return;

			const videoFormatsArray = videoFormatsByVideoQualityId.get(videoFormat.videoQualityId);

			if (videoFormatsArray === undefined)
				videoFormatsByVideoQualityId.set(videoFormat.videoQualityId, [videoFormat]);
			else videoFormatsArray.push(videoFormat);
		});

		const videoQualityById = new Map<number, Models.VideoQuality>();
		videoQualities.forEach(videoQuality => videoQualityById.set(videoQuality.id, videoQuality));

		const videoQualitiesByVideoId = new Map<number, Models.VideoQuality[]>();
		videoQualities.forEach(videoQuality => {
			const videoQualitiesArray = videoQualitiesByVideoId.get(videoQuality.videoId);

			if (videoQualitiesArray === undefined) videoQualitiesByVideoId.set(videoQuality.videoId, [videoQuality]);
			else videoQualitiesArray.push(videoQuality);
		});

		resolve({
			courses,
			courseById,
			courseByCode,

			courseClasses,
			latestCourseClasses,
			courseClassById,
			courseClassesByCourseClassListId,

			courseClassLists,
			courseClassListById,
			courseClassListsByCourseId,

			faqs,
			faqById,

			users,
			userById,
			userByUid,
			userRoleById,
			userRoleByName,
			userUserRolesByUserId,

			videos,
			videoById,
			videosByCourseClassId,

			videoFormats,
			videoFormatById,
			videoFormatsByVideoQualityId,

			videoQualities,
			videoQualityById,
			videoQualitiesByVideoId,
		});
	});

	return (internalCache = result);
};

export const reloadCache = (): Promise<CacheType> => {
	internalCache = undefined;

	return getData();
};
