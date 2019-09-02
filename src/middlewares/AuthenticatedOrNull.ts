import * as Models from "../models";

import { AuthenticationError, PermissionsError } from "../errors";
import { MiddlewareFn, UseMiddleware } from "type-graphql";

import { Context } from "../Context";
import { authenticatedMiddleware } from "./Authenticated";
import { logger } from "../utils/logger";

export const authenticatedOrNullMiddleware: (
	roles?: Array<keyof typeof Models.UserRoleName>
) => MiddlewareFn<Context> = roles => async (action, next) => {
	try {
		await authenticatedMiddleware(roles)(action, next);
	} catch (e) {
		if (e instanceof AuthenticationError || e instanceof PermissionsError) {
			logger.info("returning null");
			return null;
		}

		throw e;
	}

	return next();
};

export const AuthenticatedOrNull = (roles?: Array<keyof typeof Models.UserRoleName>) =>
	UseMiddleware(authenticatedOrNullMiddleware(roles));
