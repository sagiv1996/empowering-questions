import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Frequency, User, UserDocument } from 'src/schemas/user';
import { QuestionService } from 'src/question/question.service';
import { NotificationService } from 'src/notification/notification.service';
import { Cron } from '@nestjs/schedule';
import { Categories } from 'src/schemas/question';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { SendPushNotificationsDto } from './dto/send-push-notifications-dto';

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

  async createUser(firebaseId: string, createUserDto: CreateUserDto) {
    this.logger.log('Try to create user');
    try {
      const { frequency, fcm, gender, categories } = createUserDto;
      const user = new this.userModel({
        firebaseId,
        frequency,
        fcm,
        gender,
        categories,
      });
      const newUser = await user.save();
      this.createSendPushNotificationsForUsers({ usersIds: [newUser._id] });
      return newUser;
    } catch (error) {
      this.logger.log('Failed to create user. Try again later.');
      throw error;
    }
  }

  async updateUser(
    userId: Types.ObjectId,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    this.logger.log('Try to update user');
    console.log(`userId ${userId} updateUserDto ${updateUserDto.frequency}`);

    try {
      const { frequency, categories } = updateUserDto;
      const updateFields: { frequency?: Frequency; categories?: Categories[] } =
        {};
      if (frequency) {
        updateFields.frequency = frequency;
      }
      if (categories) {
        updateFields.categories = categories;
      }

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        updateFields,
        { new: true },
      );
      this.notificationService.deleteNotificationPerFcm(user.fcm);

      this.createSendPushNotificationsForUsers({ usersIds: [user._id] });
      return user;
    } catch (error) {
      this.logger.log('Failed to update user. Try again later.');
      throw error;
    }
  }

  async findUserIdByFirebaseId(userFirebaseId: String) {
    const user = await this.userModel.exists({ firebaseId: userFirebaseId });
    return user;
  }

  async findUserById(userId: Types.ObjectId) {
    const user = await this.userModel.findById(userId).lean();
    return user;
  }

  @Cron('0 0 7 * * *', { timeZone: 'Asia/Jerusalem' })
  async createSendPushNotificationsForUsers(
    sendPushNotificationsDto: SendPushNotificationsDto = {},
  ) {
    const query = {};
    const { usersIds } = sendPushNotificationsDto;
    if (usersIds) {
      query['_id'] = { $in: usersIds };
    }
    const users = await this.userModel.find(query).lean();
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
