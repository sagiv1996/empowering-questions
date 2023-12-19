import {
  Resolver,
  Query,
  ObjectType,
  Field,
  Mutation,
  Args,
  registerEnumType,
} from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question, genders } from 'schemas/question';
import { categories } from 'schemas/question';

registerEnumType(categories, {
  name: 'QuestionCategory',
});
registerEnumType(genders, {
  name: 'QuestionGenders',
});

@ObjectType()
export class QuestionType {
  @Field()
  id: string;

  @Field()
  string: string;

  @Field()
  category: categories;

  @Field()
  gender: genders;
}

@Resolver(() => QuestionType)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Mutation(() => QuestionType)
  createQuestion(
    @Args('string') newString: string,
    @Args('category', { type: () => categories }) newCategory: categories,
    @Args('gender', { type: () => genders }) newGender: genders,
  ): Promise<Question> {
    return this.questionService.createQuestion({
      string: newString,
      category: newCategory,
      gender: newGender,
    });
  }

  @Query(() => QuestionType)
  findRandom(): Promise<Question> {
    return this.questionService.findRandomQuestion();
  }
}
