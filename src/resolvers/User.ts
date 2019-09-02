import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Int,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
	registerEnumType,
} from "type-graphql";
import { Context } from "../Context";
import * as Data from "../data";
import * as Errors from "../errors";
import { Authenticated } from "../middlewares";
import * as Mutations from "../mutations";
import * as Schemas from "../schemas";

export enum UserRoleName {
	Admin = "admin",
	User = "user",
}
registerEnumType(UserRoleName, {
	name: "UserRoleName",
});

@InputType()
export class SignUpInput {
	@Field()
	public email: string;

	@Field()
	public password: string;
}

@ObjectType()
export class SignUpOutput {
	@Field(() => Schemas.User)
	public user: Schemas.User;

	@Field()
	public token: string;
}

@InputType()
export class SignInInput {
	@Field()
	public email: string;

	@Field()
	public password: string;
}

@ObjectType()
export class SignInOutput {
	@Field(() => Schemas.User)
	public user: Schemas.User;

	@Field()
	public token: string;
}

@Resolver(() => Schemas.User)
export class User {
	// region Mutations
	@Mutation(() => SignUpOutput, { nullable: true })
	public async signUp(@Arg("user") signUpInput: SignUpInput): Promise<{ user: Schemas.User; token: string }> {
		const signUp = await Mutations.User.signUp({ data: signUpInput });

		if (!signUp[0]) throw Errors.BadUserInputError(signUp[1]);

		return signUp[1];
	}

	@Mutation(() => SignInOutput)
	public async signIn(
		@Arg("user") userInput: SignInInput,
		@Ctx() context: Context
	): Promise<{ user: Schemas.User; token: string }> {
		const signInResponse = await Mutations.User.signIn(userInput);

		context.me = signInResponse.user;

		return signInResponse;
	}
	// endregion

	// region Queries
	@Query(() => Schemas.User, { nullable: true })
	public user(@Arg("id", () => Int) id: number): Promise<Schemas.User> {
		return Data.User.findOneOrThrow({
			id,
		});
	}

	@Query(() => Schemas.User, { nullable: true })
	@Authenticated()
	public me(@Ctx() context: Context): Promise<Schemas.User> {
		const { id } = context.me!;

		return Data.User.findOneOrThrow({
			id,
		});
	}
	// endregion

	// region FieldResolvers
	@FieldResolver(() => [Schemas.UserRole])
	public async roles(@Root() user: Schemas.User): Promise<Schemas.UserRole[]> {
		return Data.UserRole.findAllByUserId({ userId: user.id });
	}
	// endregion
}
