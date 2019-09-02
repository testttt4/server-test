import * as Data from "../data";

import { MiddlewareFn, UseMiddleware } from "type-graphql";

import { Context } from "../Context";
import { getTokenPayload } from "../utils/Helper";

export const authenticateMiddleware: () => MiddlewareFn<Context> = () => async ({ context }, next) => {
	const token = context.req.headers["x-token"];

	const payload = getTokenPayload(typeof token === "string" ? token : "");

	if (!payload) return next();

	const user = await Data.User.findOne({ id: payload.me.id });
	if (user) context.me = user;

	return next();
};

export const Authenticate = () => UseMiddleware(authenticateMiddleware());
