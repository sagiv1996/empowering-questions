import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Parent,
  Context,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'src/schemas/question';
import { ObjectId } from 'mongoose';

enum UserAction {
  ADD = 'add',
  REMOVE = 'remove',
}
registerEnumType(UserAction, {
  name: 'UserAction',
});
@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question])
  findRandomQuestionsByUserId(
    @Context() context: { req: { userId?: ObjectId } },
    @Args('excludeIds', { type: () => [ID], nullable: true, defaultValue: [] })
    excludeIds?: ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId(
      context.req.userId,
      excludeIds,
    );
  }

  @Query(() => [Question])
  randomLikesQuestionsByUserId(
    @Context() context: { req: { userId?: ObjectId } },
    @Args('excludeIds', { type: () => [ID], nullable: true, defaultValue: [] })
    excludeIds?: ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.randomLikesQuestionsByUserId(
      context.req.userId,
      excludeIds,
    );
  }

  @Query(() => Question)
  findQuestionById(
    @Args('questionId', { type: () => ID! }) questionId: ObjectId,
  ) {
    return this.questionService.findQuestionById(questionId);
  }

  @Mutation(() => Question)
  async updateUserIdsLikes(
    @Context() context: { req: { userId?: ObjectId } },
    @Args('questionId', { type: () => ID! }) questionId: ObjectId,
    @Args('action', { type: () => UserAction! }) action: UserAction,
  ) {
    if (action == UserAction.ADD) {
      return this.questionService.addUserIdToUserIdsLikes(
        questionId,
        context.req.userId,
      );
    }
    return this.questionService.removeUserIdToUserIdsLikes(
      questionId,
      context.req.userId,
    );
  }

  @ResolveField(() => Int!, { defaultValue: 0 })
  async countUsersLikes(@Parent() question: Question) {
    const { _id } = question;
    return this.questionService.countUsersLikes(_id);
  }

  @ResolveField(() => Boolean, { defaultValue: false })
  async doesUserLikeQuestion(
    @Parent() question: Question,
    @Context() context: { req: { userId?: ObjectId } },
  ) {
    return this.questionService.doesUserLikeQuestion(
      question._id,
      context.req.userId,
    );
  }
}
