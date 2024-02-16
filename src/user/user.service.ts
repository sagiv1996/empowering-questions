import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Frequency, Genders, User } from 'src/schemas/user';
import { QuestionService } from 'src/question/question.service';
import { NotificationService } from 'src/notification/notification.service';
import { Cron } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Categories } from 'src/schemas/question';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
    @Inject(NotificationService)
    private readonly notificationService: NotificationService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async upsertUser({
    firebaseId,
    frequency,
    fcm,
    gender,
    categories,
  }: {
    firebaseId: string;
    frequency: Frequency;
    gender: Genders;
    categories: Categories[];
    fcm: string;
  }): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          firebaseId,
        },
        {
          firebaseId: firebaseId,
          frequency: frequency,
          gender: gender,
          categories: categories,
          fcm: fcm,
        },
        { upsert: true, new: true },
      );
      this.createSendPushNotificationsForUsers([user.id]);
      return user;
    } catch (e) {
      throw e;
    }
  }

  async findUserById(userFirebaseId: String) {
    const user = await this.userModel
      .findOne({ firebaseId: userFirebaseId })
      .lean();
    return user;
  }

  @Cron('0 0 7 * * *')
  async createSendPushNotificationsForUsers(usersIds?: ObjectId[]) {
    this.logger.debug('createSendPushNotificationsForUsers running');
    let users: [User];
    if (usersIds) {
      users = await this.userModel.find({ _id: { $in: usersIds } }).lean();
    } else {
      users = await this.userModel.find().lean();
    }
    this.logger.debug(
      `createSendPushNotificationsForUsers, users length ${users.length}`,
    );

    for (const user of users) {
      const notificationPerDay = this.sumOfNotificationsPerDay(user.frequency);

      const questions = await this.questionService.findRandomQuestion({
        categories: user.categories,
        gender: user.gender,
        size: notificationPerDay,
      });
      this.logger.debug(
        `user: ${user._id}, notificationPerDay: ${notificationPerDay}, `,
      );
      this.notificationService.triggerNotifications(user.fcm, questions);
    }
  }

  private sumOfNotificationsPerDay(frequency: string): number {
    const frequencyWeights = { little: 1, normal: 5, extra: 6 };
    const minNotifications = frequencyWeights[frequency];
    const randomOffset = Math.floor(Math.random() * 3);

    return minNotifications + randomOffset;
  }
}
