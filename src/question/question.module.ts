import { Module, forwardRef } from '@nestjs/common';
import { QuestionService } from './question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from 'src/schemas/question';
import { UserModule } from 'src/user/user.module';
import { QuestionController } from './question.controller';

@Module({
  imports: [
    forwardRef(() => UserModule),
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [QuestionService],
  controllers: [QuestionController],
  exports: [QuestionService],
})
export class QuestionModule {}
