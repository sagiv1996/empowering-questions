import {
  Args,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  registerEnumType,
} from '@nestjs/graphql';
import { Frequency, Genders } from 'src/schemas/user';
import { UserService } from './user.service';
import { Categories } from 'src/schemas/question';

registerEnumType(Frequency, {
  name: 'FrequencyTypes',
});

registerEnumType(Genders, {
  name: 'GenderTypes',
});

@ObjectType()
export class UserType {
  @Field()
  firebaseId: string;

  @Field()
  frequency: Frequency;

  @Field()
  gender: Genders;
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
    @Args('gender', { type: () => Genders })
    gender: Genders,
    @Args('categories', { type: () => [Categories] })
    categories: Categories[],
  ) {
    console.info({ categories });
    return this.userService.createUser({
      firebaseId,
      frequency,
      gender,
      categories,
    });
  }
}
