import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Frequency, Genders, User } from 'src/schemas/user';
import { QuestionService } from 'src/question/question.service';
import { NotificationService } from 'src/notification/notification.service';
import { Cron } from '@nestjs/schedule';
import { Categories } from 'src/schemas/question';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => QuestionService))
    private readonly questionService: QuestionService,
    @Inject(NotificationService)
    private readonly notificationService: NotificationService,
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
    this.logger.log('Try to upsert user');
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
      this.notificationService.deleteNotificationPerFcm(user.fcm);
      this.createSendPushNotificationsForUsers([user.id]);
      this.logger.log('User upserted');
      return user;
    } catch (error) {
      this.logger.error('Error to upsert user', error);
      throw error;
    }
  }

  async findUserIdByFirebaseId(userFirebaseId: String) {
    const user = await this.userModel.exists({ firebaseId: userFirebaseId });
    return user;
  }

  async findUserById(userId: ObjectId) {
    const user = await this.userModel.findById(userId).lean();
    return user;
  }

  @Cron('0 0 7 * * *')
  async createSendPushNotificationsForUsers(usersIds?: ObjectId[]) {
    let users: [User];
    if (usersIds) {
      users = await this.userModel.find({ _id: { $in: usersIds } }).lean();
    } else {
      users = await this.userModel.find().lean();
    }
    this.logger.log(
      `Try to create push notification for ${users.length} users`,
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
      this.logger.log(`Push notification for ${users.length} users created`);
    }
  }

  private sumOfNotificationsPerDay(frequency: string): number {
    const frequencyWeights = { little: 1, normal: 5, extra: 6 };
    const minNotifications = frequencyWeights[frequency];
    const randomOffset = Math.floor(Math.random() * 3);

    return minNotifications + randomOffset;
  }
}
