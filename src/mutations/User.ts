import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";
import * as UserRole from "./UserRole";
import * as Validators from "../validators";
import * as jwt from "jsonwebtoken";

import moment from "moment";
import { serverConfig } from "../serverConfig";

export type SignUpFromValidatedDataOptions = {
	data: Validators.User.ValidatedSignUpData;
};
export const signUpFromValidatedData = async ({
	data,
}: SignUpFromValidatedDataOptions): Promise<{ user: Models.User; token: string }> => {
	const userRole = await UserRole.findOneOrCreate({ name: Models.UserRoleName.User });

	if (!userRole[0]) throw new Error(); // TODO

	const user = await Models.User.create({
		...data,
		createdAt: moment().toDate(),
	});
	await Models.UserUserRole.create({
		userRoleId: userRole[1].id,
		userId: user.id,
	});

	Data.Base.reloadCache();

	const token = jwt.sign({ id: user.id }, serverConfig.JWT_SECRET, { expiresIn: serverConfig.JWT_DURATION });

	return {
		token,
		user,
	};
};

export type SignUpOptions = {
	data: Validators.User.SignUpData;
};
export const signUp = async (
	options: SignUpOptions
): Promise<[true, { user: Models.User; token: string }] | [false, Validators.User.InvalidatedSignUpData]> => {
	const validation = await Validators.User.validateSignUpData(options.data);
	if (!validation[0]) return validation;

	return [true, await signUpFromValidatedData({ ...options, data: validation[1] })];
};

export type SignInOptions = {
	email: string;
	password: string;
};
export const signIn = async (options: SignInOptions): Promise<{ user: Models.User; token: string }> => {
	const { email, password } = options;

	const signInData = await Validators.User.signIn(email, password);
	const user = signInData ? await Data.User.findOne({ uid: signInData.user.uid }) : undefined;

	if (!signInData || !user) throw Errors.BadUserInputError("Los datos ingresados no son correctos");

	const token = jwt.sign(
		{
			id: user.id,
			token: signInData.token,
		},
		serverConfig.JWT_SECRET,
		{ expiresIn: serverConfig.JWT_DURATION }
	);

	return {
		token,
		user,
	};
};

const _deleteUser = async ({ user }: { user: Models.User }) => {
	user.deletedAt = moment().toISOString();

	await Models.UserUserRole.update(
		{
			deletedAt: moment().toDate(),
		},
		{
			where: {
				userId: user.id,
			},
		}
	);

	return user.save();
};

export type DeleteUserOptions = {
	id: number;
	userId: number;
};
export const deleteUser = async ({ id }: DeleteUserOptions) => {
	const user = await Data.User.findOneOrThrow({ id });

	await _deleteUser({ user });

	Data.Base.reloadCache();
};
