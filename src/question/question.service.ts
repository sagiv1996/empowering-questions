import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateQuestion } from 'src/question/dto/create-question.dto';
import { GetRandomQuestion } from 'src/question/dto/get-random-question.dto';
import { Model, Types } from 'mongoose';
import { Categories, Question } from 'src/schemas/question';
import { RankQuestion } from './dto/rank-question.dto';
import { Cron } from '@nestjs/schedule';
import { Genders, User } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { retry } from 'ts-retry-promise';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from 'src/user/user.service';
import { GetUserById } from 'src/user/dto/get-user-by-id.dto';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { GetRandomQuestionByUserId } from './dto/get-random-question-by-user-id.dto';

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

  private readonly genAI = new GoogleGenerativeAI(this.geminiApiKey);
  private readonly model = this.genAI.getGenerativeModel({
    model: 'gemini-pro',
  });

  private readonly generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  private readonly safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  @Cron('0 0 5 * * *')
  async createQuestionFromAi() {
    const promiseArray: Promise<void>[] = [];
    for (const category in Categories) {
      for (const gender in Genders) {
        const promise = retry(
          async () => {
            const text = `Create an empowering question for me that deals with ${category} for ${gender}, the sentence should be a maximum of 30 characters, and translated into Hebrew. It is important that the result be only the sentence in Hebrew.`;
            const result = await this.model.generateContent({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text,
                    },
                  ],
                },
              ],
              generationConfig: this.generationConfig,
              safetySettings: this.safetySettings,
            });

            const question = new this.questionModel({
              gender,
              category,
              string: result.response.text(),
            });
            await question.save();
          },
          {
            retries: 3,
          },
        );
        promiseArray.push(promise);
      }
    }
    await Promise.allSettled(promiseArray);
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
    getRandomQuestionByUserId: GetRandomQuestionByUserId,
  ): Promise<Question[]> {
    const user = await this.userService.getUserById(getRandomQuestionByUserId);
    const questions = await this.findRandomQuestion({
      categories: user.categories,
      gender: user.gender,
      excludeIds: getRandomQuestionByUserId.excludeIds,
    });
    return questions;
  }

  async findRandomQuestion(
    getRandomQuestion: GetRandomQuestion,
  ): Promise<Question[]> {
    this.logger.debug('findRandomQuestion', new Date());
    const { size = 3, gender, categories, excludeIds = [] } = getRandomQuestion;
    const randomQuestion = await this.questionModel.aggregate([
      {
        $addFields: {
          avgRanking: { $avg: '$ranking.rank' },
        },
      },
      {
        $match: {
          _id: { $nin: excludeIds.map((id) => new Types.ObjectId(id)) },
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
