import * as Data from "../data";
import * as Models from "../models";
import * as Validators from "../validators";

import { identity } from "../utils/Helper";
import moment from "moment";

export type CreateFromValidatedDataOptions = {
	userId: number;
	data: Required<
		Pick<
			Models.FAQ,
			keyof Omit<
				typeof Models.FAQAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const createFromValidatedData = async (options: CreateFromValidatedDataOptions): Promise<Models.FAQTableRow> => {
	const faq = await Models.FAQ.create(
		identity<Required<Pick<Models.FAQ, keyof Omit<typeof Models.FAQAttributes, "id">>>>({
			createdAt: moment().toDate(),
			createdById: options.userId,
			updatedAt: moment().toDate(),
			updatedById: options.userId,
			deletedAt: null,
			deletedById: null,
			...options.data,
		})
	);

	Data.Base.Cache.removeCache();

	return faq.toTableRow();
};

export type CreateOptions = {
	userId: number;
	data: Validators.FAQ.DataToValidate;
};
export const create = async (
	options: CreateOptions
): Promise<[true, Models.FAQTableRow] | [false, Validators.FAQ.InvalidatedData]> => {
	const validation = await Validators.FAQ.validateData(options.data);

	if (!validation[0]) return validation;

	const faq = await createFromValidatedData({ ...options, data: validation[1] });

	return [true, faq];
};

export type UpdateFromValidatedDataOptions = {
	id: number;
	userId: number;
	data: Partial<
		Pick<
			Models.FAQ,
			keyof Omit<
				typeof Models.FAQAttributes,
				"id" | "createdAt" | "createdById" | "updatedAt" | "updatedById" | "deletedAt" | "deletedById"
			>
		>
	>;
};
export const updateFromValidatedData = async <TDataKeys extends keyof Validators.FAQ.DataToValidate>(
	options: UpdateFromValidatedDataOptions
): Promise<Models.FAQTableRow> => {
	const { id, data, userId } = options;

	const faq = Models.FAQ.fromTableRow(
		await Data.FAQ.findOneOrThrow({
			id,
		})
	);

	const updateData: Partial<Pick<Models.FAQ, keyof typeof Models.FAQAttributes>> = {
		updatedAt: moment().toDate(),
		updatedById: userId,
	};

	await faq.update(
		identity<Partial<Pick<Models.FAQ, keyof typeof Models.FAQAttributes>>>({
			...updateData,
			...data,
		})
	);

	Data.Base.Cache.removeCache();

	return faq.toTableRow();
};

export type UpdateOptions<TDataKeys extends keyof Validators.FAQ.DataToValidate> = {
	id: number;
	userId: number;
	data: Pick<Validators.FAQ.DataToValidate, TDataKeys>;
};
export const update = async <TDataKeys extends keyof Validators.FAQ.DataToValidate>(
	options: UpdateOptions<TDataKeys>
): Promise<[true, Models.FAQTableRow] | [false, Validators.FAQ.InvalidatedData<TDataKeys>]> => {
	const validation = await Validators.FAQ.validateData(options.data);

	if (!validation[0]) return validation;

	return [true, await updateFromValidatedData({ ...options, data: validation[1] })];
};

const _deleteFAQ = ({ faq, userId }: { faq: Models.FAQ; userId: number }) => {
	faq.deletedAt = moment().toDate();
	faq.deletedById = userId;

	return faq.save();
};

export type DeleteFAQOptions = {
	id: number;
	userId: number;
};
export const deleteFAQ = async (options: DeleteFAQOptions) => {
	const { id, userId } = options;
	const faq = Models.FAQ.fromTableRow(await Data.FAQ.findOneOrThrow({ id }));

	await _deleteFAQ({ faq, userId });

	Data.Base.Cache.removeCache();
};
