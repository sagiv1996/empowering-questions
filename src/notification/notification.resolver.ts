import {
  Args,
  Field,
  Float,
  ID,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Types } from 'mongoose';

@ObjectType()
class Notification {
  @Field(() => Boolean, { defaultValue: false })
  isSuccess: boolean;
}

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly userService: NotificationService) {}

  @Mutation(() => Notification)
  async triggerNotifications(
    @Args('usersIds', { type: () => [ID!]! })
    usersIds: Types.ObjectId[],
  ) {
    const result = new Notification();
    try {
      this.userService.triggerNotifications({ usersIds });
      result.isSuccess = true;
    } catch (e) {
      result.isSuccess = false;
    } finally {
      return result;
    }
  }
}
