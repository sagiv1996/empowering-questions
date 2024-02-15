import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class PatchUsersIds {
  @IsMongoId()
  questionId: Types.ObjectId;

  @IsMongoId()
  userId: Types.ObjectId;
}
