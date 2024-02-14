import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user';
import { UpserteUser as UpsertUser } from './dto/upsert-user.dto';
import { FindUserById } from './dto/find-user-by-id.dto';
import { FindUsersByIds } from './dto/find-users-by-ids.dto';
import { QuestionService } from 'src/question/question.service';
import { NotificationService } from 'src/notification/notification.service';
import { Cron } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

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

  async upsertUser(upsertUser: UpsertUser): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          firebaseId: upsertUser.firebaseId,
        },
        {
          firebaseId: upsertUser.firebaseId,
          frequency: upsertUser.frequency,
          gender: upsertUser.gender,
          categories: upsertUser.categories,
          fcm: upsertUser.fcm,
        },
        { upsert: true, new: true },
      );
      this.createSendPushNotificationsForUsers({
        usersIds: [user.id],
      });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async findUserById(findUserById: FindUserById) {
    const user = await this.userModel.findById(findUserById.userId).lean();
    return user;
  }

  @Cron('0 0 7 * * *')
  async createSendPushNotificationsForUsers(findUsersByIds?: FindUsersByIds) {
    this.logger.debug('createSendPushNotificationsForUsers running');
    let users: [User];
    if (findUsersByIds?.usersIds) {
      users = await this.userModel
        .find({ _id: { $in: findUsersByIds.usersIds } })
        .lean();
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
      this.notificationService.triggerNotifications({
        fcm: user.fcm,
        questions,
      });
    }
  }

  private sumOfNotificationsPerDay(frequency: string): number {
    const frequencyWeights = { little: 1, normal: 5, extra: 6 };
    const minNotifications = frequencyWeights[frequency];
    const randomOffset = Math.floor(Math.random() * 3);

    return minNotifications + randomOffset;
  }
}
