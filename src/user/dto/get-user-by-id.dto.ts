import { IsMongoId } from 'class-validator';
import { ObjectId } from 'mongoose';

export class GetUserById {
  @IsMongoId()
  userId: ObjectId;
}
