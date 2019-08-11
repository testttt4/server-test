import * as Models from "../models";

import { getData } from "./Base";

export type FindAllByUserId = {
	userId: number;
};
export const findAllByUserId = async ({ userId }: FindAllByUserId): Promise<Models.UserRole[]> => {
	const { userUserRolesByUserId, userRoleById } = await getData();

	const result: Models.UserRole[] = [];

	(userUserRolesByUserId.get(userId) || [])
		.map(userUserRole => typeof userUserRole.userRoleId === "number" && userRoleById.get(userUserRole.userRoleId))
		.forEach(i => i && result.push(i));

	return result;
};

export type FindOneOptions = {
	name: Models.UserRoleName;
};
export const findOne = async ({ name }: FindOneOptions): Promise<Models.UserRole | undefined> => {
	const { userRoleByName } = await getData();

	return userRoleByName.get(name);
};
