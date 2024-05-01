import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Categories, Question, QuestionDocument } from 'src/schemas/question';
import { Cron } from '@nestjs/schedule';
import { Genders } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { retry } from 'ts-retry-promise';
import { UserService } from 'src/user/user.service';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  private readonly geminiApiKey = this.configService.get('GEMINI_API_KEY');

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
    this.logger.log('Try to create a random questions from AI');
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
            logger(msg) {
              Logger.debug(msg, QuestionService.name);
            },
          },
        );
        promiseArray.push(promise);
      }
    }
    await Promise.allSettled(promiseArray);
    this.logger.log('The new records from AI are created');
  }

  async randomLikesQuestionsByUserId(
    userId: Types.ObjectId,
    excludeIds?: Types.ObjectId[],
  ) {
    const randomQuestion = await this.questionModel.aggregate([
      {
        $match: {
          userIdsLikes: userId,
          _id: {
            $nin: Array.isArray(excludeIds)
              ? excludeIds.map((e) => new Types.ObjectId(e.toString()))
              : [excludeIds],
          },
        },
      },
      { $sample: { size: 3 } },
    ]);
    return randomQuestion;
  }

  async findRandomQuestionByUserId(
    userId: Types.ObjectId,
    excludeIds?: Types.ObjectId[],
  ): Promise<QuestionDocument[]> {
    const user = await this.userService.findUserById(userId);
    const questions = await this.findRandomQuestion({
      categories: user.categories,
      gender: user.gender,
      excludeIds,
    });
    return questions;
  }

  async findRandomQuestion({
    size = 3,
    gender,
    categories,
    excludeIds = [],
  }: {
    size?: number;
    gender: Genders;
    categories: Categories[];
    excludeIds?: Types.ObjectId[];
  }): Promise<QuestionDocument[]> {
    this.logger.log('Try to find a random questions');
    this.logger.debug({ size, gender, categories, excludeIds });
    const randomQuestion = await this.questionModel.aggregate([
      {
        $match: {
          _id: {
            $nin: Array.isArray(excludeIds)
              ? excludeIds.map((e) => new Types.ObjectId(e.toString()))
              : [excludeIds],
          },
          gender: gender,
          category: { $in: categories },
        },
      },
      { $sample: { size } },
    ]);
    this.logger.log('Random questions are finds');
    this.logger.debug({ randomQuestion });
    return randomQuestion;
  }

  async findQuestionById(questionId: Types.ObjectId) {
    return this.questionModel.findById(questionId).lean().orFail();
  }

  async addUserIdToUserIdsLikes(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        $addToSet: { userIdsLikes: userId },
      },
      { new: true },
    );
  }

  async removeUserIdToUserIdsLikes(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        $pull: { userIdsLikes: userId },
      },
      { new: true },
    );
  }

  async countUsersLikes(questionId: Types.ObjectId) {
    const { userIdsLikes } = await this.questionModel
      .findById(questionId)
      .select('userIdsLikes')
      .lean();
    return userIdsLikes?.length ?? 0;
  }

  async doesUserLikeQuestion(
    questionId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const questionIsExists = await this.questionModel.exists({
      _id: questionId,
      userIdsLikes: userId,
    });
    return !!questionIsExists;
  }
}
