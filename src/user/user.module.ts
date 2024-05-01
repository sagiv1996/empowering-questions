import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user';
import { QuestionModule } from 'src/question/question.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserController } from './user.controller';

@Module({
  imports: [
    forwardRef(() => QuestionModule),
    NotificationModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
