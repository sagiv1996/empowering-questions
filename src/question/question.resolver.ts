import {
  Resolver,
  Query,
  ObjectType,
  Field,
  Mutation,
  Args,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from 'src/schemas/question';
import { Categories } from 'src/schemas/question';
import { ObjectId, Types } from 'mongoose';
import { Genders } from 'src/schemas/user';

registerEnumType(Categories, {
  name: 'Categories',
});
registerEnumType(Genders, {
  name: 'Genders',
});

@ObjectType()
export class QuestionType {
  @Field()
  _id: string;

  @Field()
  string: string;

  @Field(() => Categories)
  category: Categories;

  @Field(() => Genders)
  gender: Genders;
}

@Resolver(() => QuestionType)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Mutation(() => QuestionType)
  createQuestion(
    @Args('string') newString: string,
    @Args('category', { type: () => Categories }) newCategory: Categories,
    @Args('gender', { type: () => Genders }) newGender: Genders,
  ): Promise<Question> {
    return this.questionService.createQuestion({
      string: newString,
      category: newCategory,
      gender: newGender,
    });
  }

  @Query(() => [QuestionType])
  findRandomQuestionsByUserId(
    @Args('userId', { type: () => ID! }) userId: ObjectId,
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId({
      userId,
    });
  }

  @Mutation(() => QuestionType)
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
