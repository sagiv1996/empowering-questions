import {
  Resolver,
  Query,
  ObjectType,
  Field,
  Mutation,
  Args,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'schemas/question';
import { categories } from 'dto/question/create-question.dto';

registerEnumType(categories, {
  name: 'QuestionCategory',
});

@ObjectType()
export class QuestionType {
  @Field()
  id: string;

  @Field()
  string: string;

  @Field()
  category: categories;
}

@Resolver(() => QuestionType)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Mutation(() => QuestionType)
  createQuestion(
    @Args('string') newString: string,
    @Args('category', { type: () => categories })
    newCategory: categories,
  ): Promise<Question> {
    return this.questionService.createQuestion({
      string: newString,
      category: newCategory,
    });
  }

  @Query(() => QuestionType)
  findRandom(): Promise<Question> {
    return this.questionService.findRandomQuestion();
  }
}
