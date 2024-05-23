import { Injectable, Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as admin from 'firebase-admin';
import { CronJob } from 'cron';
import { QuestionDocument } from 'src/schemas/question';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  async triggerNotifications(fcm: string, questions: QuestionDocument[]) {
    const timeForNotifications = this.getRandomDates(questions.length, {
      from: 8,
      to: 22,
    });
    for (const [index, questionForUser] of questions.entries()) {
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
                title: 'זה זמן להעצים את עצמי',
                body: questionForUser.string,
              },
              data: {
                _id: `${questionForUser._id}`,
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

  deleteNotificationPerFcm(fcm: string): void {
    this.logger.log('Deleting cron jobs for user');

    const cronJobsToDelete = Array.from(
      this.schedulerRegistry.getCronJobs().keys(),
    ).filter((jobName) => jobName.includes(fcm));

    cronJobsToDelete.forEach((cronJob) => {
      this.schedulerRegistry.deleteCronJob(cronJob);
    });

    this.logger.log(`Deleted ${cronJobsToDelete.length} cron jobs`);
  }

  private getRandomDates(
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
