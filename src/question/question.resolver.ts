import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
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
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId({
      userId,
    });
  }

  @Mutation(() => Question)
  async rankQuestion(
    @Args('questionId')
    questionId: string,
    @Args('userId')
    userId: string,
    @Args('rank') rank: number,
  ): Promise<Question> {
    return this.questionService.rankQuestion({
      questionId: questionId as unknown as ObjectId,
      userId: userId as unknown as ObjectId,
      rank,
    });
  }
}
