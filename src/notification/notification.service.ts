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

@Injectable()
export class NotificationService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(QuestionService) private readonly questionService: QuestionService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(ConfigService) private readonly configService: ConfigService,
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

  @Cron('0 0 7 * * *')
  async main() {
    this.logger.debug('Start main func in notification service', new Date());
    const users = await this.userService.getAll();

    for (const user of users) {
      const sumOfNotificationsPerDay = this.sumOfNotificationsPerDay(user);
      const timeForNotifications = this.getRandomDate(
        sumOfNotificationsPerDay,
        {},
      );

      const questionsForUser = await this.questionService.findRandomQuestion({
        categories: user.categories,
        gender: user.gender,
      });

      questionsForUser.forEach((value, index) => {
        timeForNotifications.forEach((timeForNotification) => {
          const jobName = `__pushNotification_${
            user._id
          }_${timeForNotification.getTime()}}`;

          const cronTime = new Date(
            new Date().setHours(
              timeForNotification.getHours(),
              timeForNotification.getMinutes(),
            ),
          );
          if (cronTime > new Date()) {
            const job = new CronJob(cronTime, async () => {
              await admin.messaging().send({
                token: user.fcm,
                notification: { title: 'title', body: value.string },
              });
              this.schedulerRegistry.deleteCronJob(jobName);
            });
            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();
          }
        });
      });

      this.logger.debug('finish main func in notification service', new Date());
    }
  }

  sumOfNotificationsPerDay(user: User): number {
    const frequencyObject = { little: 1, normal: 5, extra: 6 };
    const randomNumberFrom0To3 = Math.floor(
      Math.random() * 3 + frequencyObject[user.frequency],
    );
    const minNotificationPerFrequency = frequencyObject[user.frequency];

    return minNotificationPerFrequency + randomNumberFrom0To3;
  }

  getRandomDate(
    sumOfNotification: number,
    { from = 8, to = 21 }: { from?: number; to?: number },
  ) {
    const randomHours = new Set<number>();
    do {
      const randomHour = Math.floor(Math.random() * (to - from + 1)) + from;
      randomHours.add(randomHour);
    } while (randomHours.size <= sumOfNotification);

    const randomTimes: Date[] = [];

    randomHours.forEach((randomHour) => {
      const randomMinute = Math.floor(Math.random() * (60 + 1));

      const date = new Date(new Date().setHours(randomHour, randomMinute));
      randomTimes.push(date);
    });
    return randomTimes.sort();
  }
}
