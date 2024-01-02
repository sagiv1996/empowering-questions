import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/schemas/user';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationService {
  @Inject(UserService)
  private readonly userService: UserService;

  @Cron('*/5 * * * * *')
  async main() {
    const users = await this.userService.getAll();
    for (const user of users) {
      const sumOfNotificationsPerDay = this.sumOfNotificationsPerDay(user);
      const timeForNotifications = this.getRandomDate(
        sumOfNotificationsPerDay,
        {},
      );
      console.log({ user, timeForNotifications });
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
