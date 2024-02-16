import {
  Args,
  ID,
  Mutation,
  Resolver,
  registerEnumType,
  Query,
  Context,
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
    @Context() context,
    @Args('fcm')
    fcm: string,
    @Args('frequency', { type: () => Frequency })
    frequency: Frequency,
    @Args('gender', { type: () => Genders })
    gender: Genders,
    @Args('categories', { type: () => [Categories] })
    categories: Categories[],
  ) {
    return this.userService.upsertUser({
      firebaseId: context.req.uid,
      fcm,
      frequency,
      gender,
      categories,
    });
  }

  @Query(() => User)
  findUserById(@Context() context: any) {
    return this.userService.findUserById(context.req.uid);
  }

  @Mutation(() => User, { nullable: true })
  createSendPushNotificationsForUsers(
    @Args('usersIds', { type: () => [ID], nullable: true })
    usersIds?: ObjectId[],
  ) {
    return this.userService.createSendPushNotificationsForUsers(usersIds);
  }
}
