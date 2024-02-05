import { Inject, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { TriggerNotifications } from './dto/trigger-notifications.dto';

@Injectable()
export class NotificationService {
  constructor(
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

  async triggerNotifications(triggerNotifications: TriggerNotifications) {
    const { fcm, questionsString } = triggerNotifications;

    const timeForNotifications = this.getRandomDates(questionsString.length, {
      from: 8,
      to: 22,
    });
    for (const [index, questionForUser] of questionsString.entries()) {
      const cronTime: Date = new Date(
        new Date().setHours(
          timeForNotifications[index].getHours(),
          timeForNotifications[index].getMinutes(),
        ),
      );

      if (cronTime <= new Date()) continue;

      const jobName = `notification_${fcm}_${index}_${cronTime}}`;

      this.logger.debug({ fcm, time: cronTime, jobName });
      const job = new CronJob(
        cronTime,
        async () => {
          try {
            this.logger.debug('trying to send a push message', {
              fcm: fcm,
              time: cronTime,
            });
            await admin.messaging().send({
              token: fcm,
              notification: {
                title: questionForUser,
                body: 'tap here to get more questions.',
              },
            });

            this.schedulerRegistry.deleteCronJob(jobName);
            this.logger.debug('Delete logger');
          } catch (e) {
            this.logger.error({
              message: 'error with send notification',
              error: e,
              fcm,
            });
          }
        },
        null,
        true,
        'Asia/Jerusalem',
      );
      this.schedulerRegistry.addCronJob(jobName, job);
    }
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
      date.setHours(randomHour, randomMinute, 0, 0);
      randomTimes.push(date);
    });

    return randomTimes.sort((a, b) => a.getTime() - b.getTime());
  }
}
