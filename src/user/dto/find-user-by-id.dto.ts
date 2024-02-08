import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class FindUserById {
  @IsMongoId()
  userId: ObjectId;
}
