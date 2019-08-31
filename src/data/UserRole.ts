import * as Models from "../models";

import { getDataHandler } from "./Base";

export type FindAllByUserId = {
	userId: number;
};
export const findAllByUserId = getDataHandler<(options: FindAllByUserId) => Promise<Models.UserRole[]>>({
	getCacheKey: options => [options.userId].join("."),
	calculate: async (config, options) => {
		return Models.UserRole.findAll({
			include: [
				{
					model: Models.User,
					as: Models.UserRoleRelations.users,
					where: {
						[Models.UserAttributes.id]: options.userId,
					},
				},
			],
		});
	},
});

export type FindOneOptions = {
	name: keyof typeof Models.UserRoleName;
};
export const findOne = getDataHandler<(options: FindOneOptions) => Promise<Models.UserRole | null>>({
	getCacheKey: options => [options.name].join("."),
	calculate: async (config, options) =>
		Models.UserRole.findOne({
			where: {
				[Models.UserRoleAttributes.name]: options.name,
			},
		}),
});
