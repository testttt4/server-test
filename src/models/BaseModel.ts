import { Model } from "sequelize-typescript";

export class BaseModel<T> extends Model<T> {
	protected static getAttributeName(attribute: string, model: typeof Model) {
		return `${model.getTableName()}.${attribute}`;
	}
}
