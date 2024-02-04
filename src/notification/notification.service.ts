import { Inject, Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { QuestionService } from 'src/question/question.service';
import { User } from 'src/schemas/user';
import { UserService } from 'src/user/user.service';
import { Logger } from 'winston';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { GetUsersByIds } from 'src/user/dto/get-users-by-ids.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(QuestionService) private readonly questionService: QuestionService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ConfigService) configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {
    const projectId = configService.get<string>('project_id');
    const privateKey = configService
      .get<string>('private_key')
      .replace(/\\n/g, '\n');
    const clientEmail = configService.get<string>('client_email');

    admin.initializeApp({
      credential: admin.credential.cert({ projectId, privateKey, clientEmail }),
      databaseURL: 'https://xxxxx.firebaseio.com',
    });
  }

  @Cron('0 0 7 * * *', {
    timeZone: 'Asia/Jerusalem',
  })
  async triggerNotifications(getUsersByIds?: GetUsersByIds) {
    this.logger.debug('Start triggerNotifications');
    const users = await this.userService.getAll(getUsersByIds);

    for (const user of users) {
      const sumOfNotificationsPerDay = this.sumOfNotificationsPerDay(user);
      const timeForNotifications = this.getRandomDates(
        sumOfNotificationsPerDay,
        {},
      );

      const questionsForUser = await this.questionService.findRandomQuestion({
        categories: user.categories,
        gender: user.gender,
        size: sumOfNotificationsPerDay,
      });

      for (const [index, questionForUser] of questionsForUser.entries()) {
        const cronTime: Date = new Date(
          new Date().setHours(
            timeForNotifications[index].getHours(),
            timeForNotifications[index].getMinutes(),
          ),
        );
        if (cronTime <= new Date()) continue;

        const jobName = `notification_${user._id}_${index}_${cronTime}}`;

        this.logger.debug({ user: user._id, time: cronTime, jobName });
        const job = new CronJob(
          cronTime,
          async () => {
            try {
              this.logger.debug('trying to send a push message', {
                user: user._id,
                fcm: user.fcm,
                time: cronTime,
              });
              await admin.messaging().send({
                token: user.fcm,
                notification: {
                  title: questionForUser.string,
                  body: 'tap here to get more questions.',
                },
              });

              this.schedulerRegistry.deleteCronJob(jobName);
              this.logger.debug('Delete logger');
            } catch (e) {
              this.logger.error({
                message: 'error with send notification',
                error: e,
                user: user._id,
              });
            }
          },
          null,
          true,
          'Asia/Jerusalem',
        );
        this.schedulerRegistry.addCronJob(jobName, job);
      }

      this.logger.debug('triggerNotifications finish to running', new Date());
    }
  }

  sumOfNotificationsPerDay(user: User): number {
    const frequencyWeights = { little: 1, normal: 5, extra: 6 };
    const minNotifications = frequencyWeights[user.frequency];
    const randomOffset = Math.floor(Math.random() * 3);

    return minNotifications + randomOffset;
  }

  getRandomDates(
    sumOfNotifications: number,
    { from = 8, to = 21 }: { from?: number; to?: number },
  ): Date[] {
    const getRandomHour = () =>
      Math.floor(Math.random() * (to - from + 1)) + from;
    const randomHours = new Set<number>();

    while (randomHours.size < sumOfNotifications) {
      randomHours.add(getRandomHour());
    }

    const randomTimes: Date[] = [];

    randomHours.forEach((randomHour) => {
      const randomMinute = Math.floor(Math.random() * 60);
      const date = new Date();
      date.setHours(randomHour, randomMinute, 0, 0); // Reset seconds and milliseconds
      randomTimes.push(date);
    });

    return randomTimes.sort((a, b) => a.getTime() - b.getTime());
  }
}
