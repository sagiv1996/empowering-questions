import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';
import { QuestionModule } from 'src/question/question.module';
import { NotificationResolver } from './notification.resolver';

@Module({
  imports: [UserModule, QuestionModule],
  providers: [NotificationService, NotificationResolver],
})
export class NotificationModule {}
