import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class FindQuestionById {
  @IsMongoId()
  questionId: ObjectId;
}
