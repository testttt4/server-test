import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { MiddlewareFn, UseMiddleware } from "type-graphql";

import { Context } from "../Context";
import { getTokenPayload } from "../utils/Helper";
import { logger } from "../utils/logger";

export const authenticatedMiddleware: (
	roles?: Array<keyof typeof Models.UserRoleName>
) => MiddlewareFn<Context> = roles => async ({ context }, next) => {
	const token = context.req.headers["x-token"];

	const payload = getTokenPayload(typeof token === "string" ? token : "");

	if (!payload) {
		logger.warn("Not logged user");
		throw new Errors.AuthenticationError();
	}

	const user = await Data.User.findOne({
		id: payload.me.id,
	});

	if (!user) throw new Errors.AuthenticationError();

	const userRoles = await Data.UserRole.findAllByUserId({ userId: payload.me.id });

	if (!roles || roles.length === 0 || userRoles.some(userRole => roles.includes(userRole.name))) {
		context.me = user;
		return next();
	}

	logger.warn("Not enough permissions user");
	throw new Errors.PermissionsError();
};

export const Authenticated = (roles?: Array<keyof typeof Models.UserRoleName>) =>
	UseMiddleware(authenticatedMiddleware(roles));
