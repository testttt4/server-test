import * as Models from "./models";

import { Sequelize } from "sequelize-typescript";

export class CustomSequelize extends Sequelize {
	public _: {
		Course: typeof Models.Course;
		CourseClass: typeof Models.CourseClass;
		FAQ: typeof Models.FAQ;
		User: typeof Models.User;
		UserRole: typeof Models.UserRole;
		VideoQuality: typeof Models.VideoQuality;
		VideoFormat: typeof Models.VideoFormat;
	};
}
