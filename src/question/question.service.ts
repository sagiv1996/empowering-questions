import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateQuestion } from 'src/question/dto/create-question.dto';
import { GetRandomQuestion } from 'src/question/dto/get-random-question.dto';
import { Model } from 'mongoose';
import { Categories, Question } from 'src/schemas/question';
import { RankQuestion } from './dto/rank-question.dto';
import { Cron } from '@nestjs/schedule';
import { Genders } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { fetchDataFromGemini } from './utils';
import { retry } from 'ts-retry-promise';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    private readonly configService: ConfigService,
  ) {}

  private readonly geminiApiKey =
    this.configService.get<string>('GEMINI_API_KEY');
  @Cron('0 0 5 * * *')
  async createQuestionFromAi() {
    const fetchAndInsertFunctions: Promise<void>[] = [];
    Object.values(Genders).forEach((gender) => {
      Object.values(Categories).forEach((category) => {
        fetchAndInsertFunctions.push(this.fetchAndInsert(category, gender));
      });
    });
    await Promise.allSettled(fetchAndInsertFunctions);

    const count = await this.questionModel.countDocuments();
    console.log({ count });
  }

  private async fetchAndInsert(category: Categories, gender: Genders) {
    await retry(
      async () => {
        const dataFromGemini = await fetchDataFromGemini(
          category,
          gender,
          this.geminiApiKey,
        );
        const createQuestion: CreateQuestion = {
          category,
          gender,
          string: dataFromGemini,
        };

        await this.createQuestion(createQuestion);
      },
      {
        retries: 3,
        logger: (msg: string) => `Error with msg`,
      },
    );
  }

  async createQuestion(createQuestion: CreateQuestion): Promise<Question> {
    try {
      const question = new this.questionModel({ ...createQuestion });
      await question.save();
      return question;
    } catch (error) {
      console.error({ error });
      throw 'Error creating question';
    }
  }

  async findRandomQuestion(
    getRandomQuestion: GetRandomQuestion,
  ): Promise<Question[]> {
    const { size = 3, gender, categories } = getRandomQuestion;
    const randomQuestion = await this.questionModel.aggregate([
      {
        $addFields: {
          avgRanking: { $avg: '$ranking.rank' },
        },
      },
      {
        $match: {
          gender: gender,
          category: { $in: categories },
          $or: [{ avgRanking: { $gte: 3.5 } }, { ranking: { $exists: false } }],
        },
      },
      { $sample: { size } },
    ]);
    return randomQuestion;
  }

  async rankQuestion(rankQuestion: RankQuestion): Promise<Question> {
    const { questionId, userId, rank } = rankQuestion;

    const question = await this.questionModel.findOneAndUpdate(
      {
        _id: questionId,
        'ranking.userId': userId,
      },
      {
        $set: { 'ranking.$.rank': rank },
      },
      { new: true },
    );
    if (question) {
      return question;
    }

    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        $push: {
          ranking: { userId, rank },
        },
      },
      {
        new: true,
        upsert: true, // Create the document if it doesn't exist
      },
    );
  }
}
