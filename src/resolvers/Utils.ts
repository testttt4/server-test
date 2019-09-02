import * as Data from "../data";

import { Int, Query } from "type-graphql";

export class Utils {
	@Query(() => Int, { nullable: true })
	public reloadCache(): null {
		Data.Base.Cache.removeCache();

		return null;
	}
}
