import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateQuestion } from 'src/question/dto/create-question.dto';
import { GetRandomQuestion } from 'src/question/dto/get-random-question.dto';
import { Model } from 'mongoose';
import { Question } from 'src/schemas/question';

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
      {
        $addFields: {
          avgRanking: { $avg: '$ranking.rank' },
        },
      },
      {
        $match: {
          avgRanking: { $gte: 3.5 },
        },
      },
      { $sample: { size: 1 } },
    ]);
    return randomQuestion;
  }
}
