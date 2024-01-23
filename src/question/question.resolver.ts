import { Resolver, Query, Mutation, Args, ID, Float } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'src/schemas/question';
import { ObjectId } from 'mongoose';

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question])
  findRandomQuestionsByUserId(
    @Args('userId', { type: () => ID! }) userId: ObjectId,
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId({
      userId,
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
}
