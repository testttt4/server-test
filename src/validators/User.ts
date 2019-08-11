import * as Data from "../data";
import * as Errors from "../errors";

import axios from "axios";
import { validateString } from "./Base";

// TODO: delete axios

export const validateEmail = (email: string): [true, string] | [false, Errors.BadUserInput[]] => {
	email = email.trim().toLowerCase();
	const errors = validateString({ value: email, max: 255, notEmpty: true });

	return errors.length > 0 ? [false, errors] : [true, email];
};

export const signIn = async (
	email: string,
	password: string
): Promise<{ token: string; user: { uid: string; cn: string } } | null> => {
	const requestData = {
		username: email.split("@")[0],
		password,
	};

	try {
		const signInResponse = await axios.post<{
			token?: string;
			user?: { uid?: string; cn?: string | undefined | null };
		} | null>("http://openfing-devel.fing.edu.uy/openfing/login/authenticate", requestData, {
			headers: {
				"Content-Type": "application/json;charset=UTF-8",
			},
		});

		const { status, data: responseData } = signInResponse;

		if (status === 200 && responseData) {
			const { token, user } = responseData;

			if (typeof token === "string" && user && typeof user.uid === "string" && user.cn)
				return {
					token,
					user: {
						uid: user.uid,
						cn: user.cn,
					},
				};
		}
	} catch (e) {
		/**/
	}

	return null;
};

export type SignUpData = {
	email: string;
	password: string;
};
export type ValidatedSignUpData = {
	email: string;
	uid: string;
	name: string;
};
export type InvalidatedSignUpData = Partial<Record<keyof SignUpData, Errors.BadUserInput | Errors.BadUserInput[]>>;
export const validateSignUpData = async (
	data: SignUpData
): Promise<[true, ValidatedSignUpData] | [false, InvalidatedSignUpData]> => {
	const errors: InvalidatedSignUpData = {};

	let email = "";
	const emailValidation = await validateEmail(data.email);
	if (emailValidation[0]) email = emailValidation[1];
	else errors.email = emailValidation[1];

	let name = "";
	let uid = "";

	const userData = await signIn(data.email, data.password);
	if (userData) {
		name = userData.user.cn;
		uid = userData.user.uid;
	}

	const userWithSameUid = await Data.User.findOne({ uid });

	if (uid.length === 0 || userWithSameUid)
		throw Errors.BadUserInputError("Ocurrió un error al intentar iniciar sesión.");

	return Object.keys(errors).length > 0
		? [false, errors]
		: [
				true,
				{
					email,
					uid,
					name,
				},
		  ];
};
