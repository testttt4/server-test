import * as Data from "../data";
import * as Errors from "../errors";
import * as Models from "../models";

import { validateNumber, validateString } from "./Base";

import { Nullable } from "../typings/helperTypes";

export const validateTitle = (title: string): [true, string] | [false, Errors.BadUserInput[]] => {
	title = title.trim();
	const errors = validateString({ value: title, notEmpty: true, max: 255 });

	return errors.length > 0 ? [false, errors] : [true, title];
};

export type ValidateNumberOptions = {
	courseClassNumber: number;
	courseClassListId: number;
};
export const validateCourseClassNumber = async (
	options: ValidateNumberOptions
): Promise<[true, number] | [false, Errors.BadUserInput[]]> => {
	const { courseClassNumber, courseClassListId } = options;

	const errors = validateNumber({ value: courseClassNumber, min: 0, max: 10000 });

	const classWithSameNumber: undefined | Models.CourseClass = await Data.CourseClass.findOne({
		courseClassListId,
		number: courseClassNumber,
	});

	if (classWithSameNumber)
		errors.push({
			code: "INVALID_VALUE",
			message: `Ya existe una clase con número ${courseClassNumber} en la lista.`,
		});

	return errors.length > 0 ? [false, errors] : [true, courseClassNumber];
};

export type CreateData = {
	courseClassListId: number;
	number: number;
	title: string;
	disabled?: Nullable<boolean>;
};
export type ValidateDataOptions = {
	data: CreateData;
};
export type ValidatedCreateData = {
	courseClassListId: number;
	number: number;
	title: string;
	disabled: boolean;
};
export type InvalidatedCreateData = Partial<
	Record<
		keyof Pick<CreateData, "courseClassListId" | "number" | "title" | "disabled">,
		Errors.BadUserInput | Errors.BadUserInput[]
	>
>;
export const validateData = async ({
	data,
}: ValidateDataOptions): Promise<[true, ValidatedCreateData] | [false, InvalidatedCreateData]> => {
	const errors: InvalidatedCreateData = {};

	const courseClassListId = data.courseClassListId;
	if (!(await Data.CourseClassList.findOne({ id: courseClassListId })))
		errors.courseClassListId = { code: "INVALID_VALUE" };

	let title = "";
	const titleValidation = validateTitle(data.title);
	if (titleValidation[0]) title = titleValidation[1];
	else errors.title = titleValidation[1];

	let number = 0;
	const courseClassNumberValidation = await validateCourseClassNumber({
		courseClassNumber: data.number,
		courseClassListId: data.courseClassListId,
	});
	if (courseClassNumberValidation[0]) number = courseClassNumberValidation[1];
	else errors.number = courseClassNumberValidation[1];

	const disabled = typeof data.disabled === "boolean" && data.disabled;

	return Object.keys(errors).length > 0
		? [false, errors]
		: [
				true,
				{
					courseClassListId,
					title,
					number,
					disabled,
				},
		  ];
};

export type UpdateData = {
	id: number;
	number?: Nullable<number>;
	title?: Nullable<string>;
	disabled?: Nullable<boolean>;
};
export type ValidatedUpdateData = {
	id: number;
	number?: number;
	title?: string;
	disabled?: boolean;
};
export type InvalidatedUpdateData = Partial<
	Record<keyof Pick<UpdateData, "number" | "title">, Errors.BadUserInput | Errors.BadUserInput[]>
>;
export const validateUpdateData = async (
	data: UpdateData
): Promise<[true, ValidatedUpdateData] | [false, InvalidatedUpdateData]> => {
	const validatedData: ValidatedUpdateData = {
		id: data.id,
	};
	const errors: InvalidatedUpdateData = {};

	const courseClass = await Data.CourseClass.findOneOrThrow({ id: data.id, includeDisabled: true });
	const courseClassList = await Data.CourseClassList.findOneOrThrow({
		id: courseClass.courseClassListId,
	});

	if (data.number !== undefined && data.number !== null && data.number !== courseClass.number) {
		const courseClassNumberValidation = await validateCourseClassNumber({
			courseClassNumber: data.number,
			courseClassListId: courseClassList.id,
		});

		if (courseClassNumberValidation[0]) validatedData.number = courseClassNumberValidation[1];
		else errors.number = courseClassNumberValidation[1];
	} else validatedData.number = undefined;

	if (data.title !== undefined && data.title !== null) {
		const titleValidation = validateTitle(data.title);

		if (titleValidation[0]) validatedData.title = titleValidation[1];
		else errors.title = titleValidation[1];
	} else validatedData.title = undefined;

	return Object.values(errors).length > 0 ? [false, errors] : [true, validatedData];
};
