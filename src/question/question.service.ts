import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Categories, Question, QuestionDocument } from 'src/schemas/question';
import { Genders } from 'src/schemas/user';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

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

  async findRandomQuestionsByUserId(
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
  async findRandomQuestionByUserId(
    userId: Types.ObjectId,
    excludeIds?: Types.ObjectId[],
  ): Promise<QuestionDocument> {
    const user = await this.userService.findUserById(userId);
    const [question] = await this.findRandomQuestion({
      categories: user.categories,
      gender: user.gender,
      excludeIds,
      size: 1,
    });
    return question;
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
