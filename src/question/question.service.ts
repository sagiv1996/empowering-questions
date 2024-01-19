import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateQuestion } from 'src/question/dto/create-question.dto';
import { GetRandomQuestion } from 'src/question/dto/get-random-question.dto';
import { Model } from 'mongoose';
import { Categories, Question } from 'src/schemas/question';
import { RankQuestion } from './dto/rank-question.dto';
import { Cron } from '@nestjs/schedule';
import { Genders, User } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { fetchDataFromGemini } from './utils';
import { retry } from 'ts-retry-promise';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from 'src/user/user.service';
import { GetUserById } from 'src/user/dto/get-user-by-id.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @Inject(UserService) private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private readonly geminiApiKey =
    this.configService.get<string>('GEMINI_API_KEY');
  @Cron('0 0 5 * * *')
  async createQuestionFromAi() {
    this.logger.debug('Start cron job, createQuestionFromAi', new Date());
    const fetchAndInsertFunctions: Promise<void>[] = [];
    Object.values(Genders).forEach((gender) => {
      Object.values(Categories).forEach((category) => {
        fetchAndInsertFunctions.push(this.fetchAndInsert(category, gender));
      });
    });
    this.logger.debug('start promise ', new Date());

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
        logger: (msg: string) => this.logger.error(`error ${msg}`, new Date()),
      },
    );
  }

  async createQuestion(createQuestion: CreateQuestion): Promise<Question> {
    try {
      const question = new this.questionModel({ ...createQuestion });
      await question.save();
      return question;
    } catch (error) {
      this.logger.error({ error, date: new Date() });
    }
  }

  async findRandomQuestionByUserId(
    getUserById: GetUserById,
  ): Promise<Question[]> {
    const user = await this.userService.getUserById(getUserById);
    const questions = await this.findRandomQuestion({
      categories: user.categories,
      gender: user.gender,
    });
    return questions;
  }
  async findRandomQuestion(
    getRandomQuestion: GetRandomQuestion,
  ): Promise<Question[]> {
    this.logger.debug('findRandomQuestion', new Date());
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
    this.logger.debug({ randomQuestion, date: new Date() });
    return randomQuestion;
  }

  async rankQuestion(rankQuestion: RankQuestion): Promise<Question> {
    this.logger.debug('rankQuestion', new Date());
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
      this.logger.debug('question', new Date());
      return question;
    }

    this.logger.debug('create a new one', new Date());
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
