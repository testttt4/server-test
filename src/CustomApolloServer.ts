import * as express from "express";

import { ApolloServer, GraphQLOptions } from "apollo-server-express";
import queryComplexity, { fieldConfigEstimator, simpleEstimator } from "graphql-query-complexity";

import { logger } from "./utils/logger";

export class CustomApolloServer extends ApolloServer {
	public async createGraphQLServerOptions(req: express.Request, res: express.Response): Promise<GraphQLOptions> {
		const options = await super.createGraphQLServerOptions(req, res);

		return {
			...options,
			validationRules: [
				queryComplexity({
					// The maximum allowed query complexity, queries above this threshold will be rejected
					maximumComplexity: 10,
					// The query variables. This is needed because the variables are not available
					// in the visitor of the graphql-js library
					variables: req.body.variables,
					// Optional callback function to retrieve the determined query complexity
					// Will be invoked weather the query is rejected or not
					// This can be used for logging or to implement rate limiting
					onComplete: (complexity: number) => {
						logger.info(`Query Complexity:  ${complexity}`);
					},
					estimators: [
						// Using fieldConfigEstimator is mandatory to make it work with type-graphql
						fieldConfigEstimator(),
						// This will assign each field a complexity of 1 if no other estimator
						// returned a value. We can define the default value for field not explicitly annotated
						simpleEstimator({
							defaultComplexity: 0,
						}),
					],
				}),
			] as any,
		};
	}
}
