import { createError } from "apollo-errors";

export const AuthenticationError = createError("UNAUTHENTICATED", {
	message: "Necesita estar logueado para realizar esta acción.",
});

export const PermissionsError = createError("NOT_ENOUGH_PERMISSIONS", {
	message: "No tiene permisos suficientes.",
});

export const ObjectNotFoundError = createError("OBJECT_NOT_FOUND", {
	message: "No se encontró el objeto.",
});

export type BadUserInputCode = "EMPTY_FIELD" | "ALREADY_IN_USE" | "INVALID_VALUE" | "MAX_LENGTH" | "MIN_LENGTH";

export type BadUserInput = {
	code: BadUserInputCode;
	message?: string;
};

export type BadUserInputValue = {
	[key: number]: BadUserInput | BadUserInput[] | undefined | BadUserInputValue | Array<BadUserInputValue | undefined>;
	[key: string]: BadUserInput | BadUserInput[] | undefined | BadUserInputValue | Array<BadUserInputValue | undefined>;
};

export const BadUserInputError = (
	values: BadUserInputValue | Array<BadUserInput | BadUserInputValue | undefined> | string
) =>
	new (createError("BAD_USER_INPUT", {
		data: typeof values !== "string" ? values : undefined,
		message: typeof values !== "string" ? "Errores de validación." : values,
	}))();
