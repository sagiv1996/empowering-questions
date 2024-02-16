import {
  Resolver,
  Query,
  Args,
  ID,
  Mutation,
  ResolveField,
  Parent,
  Float,
  Info,
  Context,
} from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'src/schemas/question';
import { ObjectId, Types } from 'mongoose';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question])
  findRandomQuestionsByUserId(
    @Context() context: any,
    @Args('excludeIds', { type: () => [ID], nullable: true, defaultValue: [] })
    excludeIds?: ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId(
      context.req.uid,
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
  addUserIdToUserIdsLikes(
    @Context() context: any,
    @Args('questionId', { type: () => ID! }) questionId: ObjectId,
  ) {
    return this.questionService.addUserIdToUserIdsLikes(
      questionId,
      context.req.uid,
    );
  }

  @Mutation(() => Question)
  removeUserIdToUserIdsLikes(
    @Context() context: any,
    @Args('questionId', { type: () => ID! }) questionId: ObjectId,
  ) {
    return this.questionService.removeUserIdToUserIdsLikes(
      questionId,
      context.req.uid,
    );
  }

  @ResolveField(() => Float!, { defaultValue: 0 })
  async countUsersLikes(@Parent() question: Question) {
    const { _id } = question;
    return this.questionService.countUsersLikes(_id);
  }

  @ResolveField(() => Boolean, { nullable: true })
  async doesUserLikeQuestion(@Parent() question: Question, @Info() info: any) {
    const userId = info?.variableValues?.userId;
    if (userId)
      return this.questionService.doesUserLikeQuestion(question._id, userId);
  }
}
