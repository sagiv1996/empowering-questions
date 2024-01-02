import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [UserModule, QuestionModule],
  providers: [NotificationService],
})
export class NotificationModule {}
