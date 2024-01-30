import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Float,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
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

  @Mutation(() => Question)
  rankQuestion(
    @Args('questionId', { type: () => ID! })
    questionId: ObjectId,
    @Args('userId', { type: () => ID! })
    userId: ObjectId,
    @Args('rank', { type: () => Float! }) rank: number,
  ): Promise<Question> {
    return this.questionService.rankQuestion({
      questionId: questionId,
      userId: userId,
      rank,
    });
  }

  @ResolveField('avgRanking', () => Float, { nullable: true })
  async posts(@Parent() question: Question) {
    return question.avgRanking ?? this.questionService.questionId(question._id);
  }
}
