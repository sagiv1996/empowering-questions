import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateQuestion } from 'dto/question/create-question.dto';
import { GetRandomQuestion } from 'dto/question/get-random-question.dto';
import { Model } from 'mongoose';
import { Question } from 'schemas/question';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async createQuestion(createQuestion: CreateQuestion): Promise<Question> {
    try {
      const question = await this.questionModel.create(createQuestion);
      return question;
    } catch {
      throw 'Error';
    }
  }

  async findRandomQuestion(
    getRandomQuestion: GetRandomQuestion,
  ): Promise<Question> {
    const [randomQuestion] = await this.questionModel.aggregate([
      {
        $match: {
          gender: getRandomQuestion.gender,
          category: { $in: getRandomQuestion.categories },
        },
      },
      { $sample: { size: 1 } },
    ]);
    return randomQuestion;
  }
}
