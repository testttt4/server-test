import * as Errors from "../errors";
import * as Models from "../models";

import { getData } from "./Base";

export type FindAllOptions = {
	includeDeleted?: boolean;
};

export const findAll = async ({ includeDeleted }: FindAllOptions): Promise<Models.FAQ[]> => {
	const { faqs } = await getData();

	if (!includeDeleted) return faqs;

	return Models.FAQ.findAll();
};

export type FindOneOptions = {
	id: number;
	includeDeleted?: boolean;
};
export const findOne = async ({ id, includeDeleted }: FindOneOptions): Promise<Models.FAQ | undefined> => {
	const { faqById } = await getData();

	if (!includeDeleted) return faqById.get(id);

	return (
		(await Models.FAQ.findOne({
			where: {
				id,
			},
		})) || undefined
	);
};

export const findOneOrThrow = async (options: FindOneOptions): Promise<Models.FAQ> => {
	const result = await findOne(options);

	if (!result) throw new Errors.ObjectNotFoundError("La faq no existe");

	return result;
};
