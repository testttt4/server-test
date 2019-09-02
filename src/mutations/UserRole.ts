import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import { identity } from "../utils/Helper";
import moment from "moment";

export type FindOneOrCreateOptions = {
	name: keyof typeof Models.UserRoleName;
};

export const findOneOrCreate = async (
	options: FindOneOrCreateOptions
): Promise<[true, Models.UserRoleTableRow] | [false, Validators.UserRole.InvalidatedCreateData]> => {
	let userRoleTableRow = await Data.UserRole.findOne({ name: options.name });

	if (userRoleTableRow) return [true, userRoleTableRow];

	const validation = await Validators.UserRole.validateCreateData({ name: options.name });
	if (!validation[0]) return validation;

	const userRole = new Models.UserRole(
		identity<Omit<Models.UserRoleTableRow, "id">>({
			name: validation[1].name,
			createdAt: moment().toDate(),
			updatedAt: moment().toDate(),
			deletedAt: null,
		})
	);

	await userRole.save();

	Data.Base.Cache.removeCache();

	return [true, (await new Models.UserRole(identity<Models.UserRoleTableRow>(userRole)).save()).toTableRow()];
};
