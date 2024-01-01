import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [NotificationService],
})
export class NotificationModule {}
