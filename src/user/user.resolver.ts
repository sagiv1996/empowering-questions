import {
  Args,
  ID,
  Mutation,
  Resolver,
  registerEnumType,
  Query,
} from '@nestjs/graphql';
import { Frequency, Genders, User } from 'src/schemas/user';
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

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
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

  @Query(() => User)
  getUserById(@Args('userId', { type: () => ID! }) userId: ObjectId) {
    return this.userService.getUserById({ userId });
  }
}
