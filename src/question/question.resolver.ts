import { Resolver, Query, Args, ID } from '@nestjs/graphql';
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
}
