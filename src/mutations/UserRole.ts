import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

export type FindOneOrCreateOptions = {
	name: keyof typeof Models.UserRoleName;
};

export const findOneOrCreate = async (
	options: FindOneOrCreateOptions
): Promise<[true, Models.UserRole] | [false, Validators.UserRole.InvalidatedCreateData]> => {
	let userRole = await Data.UserRole.findOne({ name: options.name });

	if (userRole) return [true, userRole];

	const validation = await Validators.UserRole.validateCreateData({ name: options.name });
	if (!validation[0]) return validation;

	userRole = await Models.UserRole.create({ name: validation[1].name });

	Data.Base.Cache.removeCache();

	return [true, userRole];
};
