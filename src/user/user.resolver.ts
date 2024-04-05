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
  createUser(
    @Context() context: { req: { firebaseId?: string } },
    @Args('fcm')
    fcm: string,
    @Args('frequency', { type: () => Frequency })
    frequency: Frequency,
    @Args('gender', { type: () => Genders })
    gender: Genders,
    @Args('categories', { type: () => [Categories] })
    categories: Categories[],
  ) {
    return this.userService.createUser({
      firebaseId: context.req.firebaseId,
      fcm,
      frequency,
      gender,
      categories,
    });
  }
  @Mutation(() => User)
  updateUser(
    @Context() context: { req: { userId?: ObjectId } },
    @Args('frequency', { type: () => Frequency, nullable: true })
    frequency: Frequency,
    @Args('categories', { type: () => [Categories], nullable: true })
    categories: Categories[],
  ) {
    return this.userService.updateUser( context.req.userId, {
      frequency,
      categories,
    });
  }

  @Query(() => User)
  findUserById(@Context() context: { req: { userId?: ObjectId } }) {
    return this.userService.findUserById(context.req.userId);
  }

  @Mutation(() => User, { nullable: true })
  createSendPushNotificationsForUsers(
    @Args('usersIds', { type: () => [ID], nullable: true })
    usersIds?: ObjectId[],
  ) {
    return this.userService.createSendPushNotificationsForUsers(usersIds);
  }
}
