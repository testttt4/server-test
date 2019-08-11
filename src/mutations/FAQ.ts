import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import moment from "moment";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Validators.FAQ.ValidatedCreateData;
};
export const createFromValidatedData = async ({
	data,
	userId,
}: CreateFromValidatedDataOptions): Promise<Models.FAQ> => {
	const videoFormat = await Models.FAQ.create({
		...data,
		createdAt: moment().toDate(),
		createdBy: userId,
	});

	Data.Base.reloadCache();

	return videoFormat;
};

export type CreateOptions = {
	userId: number;
	data: Validators.FAQ.CreateData;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.FAQ] | [false, Validators.FAQ.InvalidatedCreateData]> => {
	const validation = await Validators.FAQ.validateCreateData(options.data);
	if (!validation[0]) return validation;

	return [true, await createFromValidatedData({ ...options, data: validation[1] })];
};

export type UpdateFromValidatedDataOptions = {
	id: number;
	userId: number;
	data: Validators.FAQ.ValidatedUpdateData;
};
export const updateFromValidatedData = async ({
	id,
	data,
	userId,
}: UpdateFromValidatedDataOptions): Promise<Models.FAQ> => {
	const faq = await Data.FAQ.findOneOrThrow({
		id,
	});

	await faq.update({ ...data, updatedAt: moment().toDate(), updatedBy: userId });

	Data.Base.reloadCache();

	return faq;
};

export type UpdateOptions = {
	id: number;
	userId: number;
	data: Validators.FAQ.UpdateData;
};
export const update = async (
	options: UpdateOptions
): Promise<[true, Models.FAQ] | [false, Validators.FAQ.InvalidatedUpdateData]> => {
	const validation = await Validators.FAQ.validateUpdateData(options.data);
	if (!validation[0]) return validation;

	return [true, await updateFromValidatedData({ ...options, data: validation[1] })];
};

const _deleteFAQ = ({ faq, userId }: { faq: Models.FAQ; userId: number }) => {
	faq.deletedAt = moment().toISOString();
	faq.deletedBy = userId;

	return faq.save();
};

export type DeleteFAQOptions = {
	id: number;
	userId: number;
};
export const deleteFAQ = async ({ id, userId }: DeleteFAQOptions) => {
	const faq = await Data.FAQ.findOneOrThrow({ id });

	await _deleteFAQ({ faq, userId });

	Data.Base.reloadCache();
};
