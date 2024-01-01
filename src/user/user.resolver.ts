import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { Frequency } from 'src/schemas/user';
import { UserService } from './user.service';

registerEnumType(Frequency, {
  name: 'FrequencyTypes',
});

@ObjectType()
export class UserType {
  @Field()
  firebaseId: string;

  @Field()
  frequency: Frequency;
}

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => UserType)
  createUser(
    @Args('firebaseId')
    firebaseId: string,
    @Args('frequency', { type: () => Frequency })
    frequency: Frequency,
  ) {
    return this.userService.createUser({ firebaseId, frequency });
  }
}
