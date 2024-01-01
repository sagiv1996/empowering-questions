import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { User } from 'src/schemas/user';
import { UserService } from 'src/user/user.service';

@Injectable()
export class NotificationService {
  @Inject(UserService)
  private readonly userService: UserService;

  @Cron('*/10 * * * * *')
  async main() {
    console.log('Start codeing..');
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
    const frequencyObject = { little: 1, normal: 5, extra: 7 };
    const randomNumberFrom0To3 = Math.floor(
      Math.random() * 3 + frequencyObject[user.frequency],
    );
    const minNotificationPerFrequency = frequencyObject[user.frequency];

    return minNotificationPerFrequency + randomNumberFrom0To3;
  }

  getRandomDate(
    sumOfNotification: number,
    { from = new Date().setHours(8), to = new Date().setHours(21) },
  ) {
    const resArray = [];
    for (let i = 0; i < sumOfNotification; i++) {
      resArray.push(new Date(from + Math.random() * (to - from)));
    }
    return resArray.sort();
  }
}
