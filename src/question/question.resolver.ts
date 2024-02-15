import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'src/schemas/question';
import { ObjectId, Types } from 'mongoose';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question])
  findRandomQuestionsByUserId(
    @Args('userId', { type: () => ID! }) userId: ObjectId,
    @Args('excludeIds', { type: () => [ID], nullable: true, defaultValue: [] })
    excludeIds?: Types.ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId({
      userId,
      excludeIds,
    });
  }

  @Query(() => Question)
  findQuestionById(
    @Args('questionId', { type: () => ID! }) questionId: ObjectId,
  ) {
    return this.questionService.findQuestionById({ questionId });
  }

  @Mutation(() => Question)
  addUserIdToUserIdsLikes(
    @Args('questionId', { type: () => ID! }) questionId: Types.ObjectId,
    @Args('userId', { type: () => ID! }) userId: Types.ObjectId,
  ) {
    return this.questionService.addUserIdToUserIdsLikes({ questionId, userId });
  }

  @Mutation(() => Question)
  removeUserIdToUserIdsLikes(
    @Args('questionId', { type: () => ID! }) questionId: Types.ObjectId,
    @Args('userId', { type: () => ID! }) userId: Types.ObjectId,
  ) {
    return this.questionService.removeUserIdToUserIdsLikes({
      questionId,
      userId,
    });
  }
}
