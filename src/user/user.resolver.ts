import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Resolver,
  registerEnumType,
  Query,
} from '@nestjs/graphql';
import { Frequency, Genders } from 'src/schemas/user';
import { UserService } from './user.service';
import { Categories } from 'src/schemas/question';
import { ObjectId } from 'mongoose';

registerEnumType(Frequency, {
  name: 'Frequency',
});

registerEnumType(Genders, {
  name: 'Genders',
});

registerEnumType(Categories, {
  name: 'Categories',
});

@ObjectType()
export class UserType {
  @Field(() => ID!)
  _id: ObjectId;

  @Field()
  firebaseId: string;

  @Field(() => Frequency)
  frequency: Frequency;

  @Field(() => Genders)
  gender: Genders;

  @Field(() => [Categories])
  categories: Categories[];
}

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserType)
  upsertUser(
    @Args('firebaseId')
    firebaseId: string,
    @Args('frequency', { type: () => Frequency })
    frequency: Frequency,
    @Args('gender', { type: () => Genders })
    gender: Genders,
    @Args('categories', { type: () => [Categories] })
    categories: Categories[],
  ) {
    return this.userService.upsertUser({
      firebaseId,
      frequency,
      gender,
      categories,
    });
  }

  @Query(() => UserType)
  getUserById(@Args('userId', { type: () => ID! }) userId: ObjectId) {
    return this.userService.getUserById({ userId });
  }
}
