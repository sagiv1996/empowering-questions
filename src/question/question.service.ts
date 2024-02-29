import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Categories, Question } from 'src/schemas/question';
import { Cron } from '@nestjs/schedule';
import { Genders } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { retry } from 'ts-retry-promise';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from 'src/user/user.service';
import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
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

  async findRandomQuestionByUserId(
    userId: string,
    excludeIds?: ObjectId[],
  ): Promise<Question[]> {
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
    excludeIds?: ObjectId[];
  }): Promise<Question[]> {
    this.logger.debug('findRandomQuestion', new Date());
    const randomQuestion = await this.questionModel.aggregate([
      {
        $match: {
          _id: {
            $nin: excludeIds.map((e) => new Types.ObjectId(e.toString())),
          },
          gender: gender,
          category: { $in: categories },
        },
      },
      { $sample: { size } },
    ]);
    this.logger.debug({ randomQuestion, date: new Date() });
    return randomQuestion;
  }

  async findQuestionById(questionId: ObjectId) {
    return this.questionModel.findById(questionId).lean().orFail();
  }

  async addUserIdToUserIdsLikes(questionId: ObjectId, userFirebaseId: string) {
    const user = await this.userService.findUserById(userFirebaseId);
    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        $addToSet: { userIdsLikes: user._id },
      },
      { new: true },
    );
  }

  async removeUserIdToUserIdsLikes(
    questionId: ObjectId,
    userFirebaseId: string,
  ) {
    const user = await this.userService.findUserById(userFirebaseId);
    return this.questionModel.findByIdAndUpdate(
      questionId,
      {
        $pull: { userIdsLikes: user._id },
      },
      { new: true },
    );
  }

  async countUsersLikes(questionId: ObjectId) {
    const { userIdsLikes } = await this.questionModel
      .findById(questionId)
      .select('userIdsLikes')
      .lean();
    return userIdsLikes?.length ?? 0;
  }

  async doesUserLikeQuestion(questionId: ObjectId, userFirebaseId: string) {
    const user = await this.userService.findUserById(userFirebaseId);
    const questionIsExists = await this.questionModel.exists({
      _id: questionId,
      userIdsLikes: user._id,
    });
    return !!questionIsExists;
  }
}
