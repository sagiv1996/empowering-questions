import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { ObjectId, Types } from 'mongoose';

export class FindRandomQuestionByUserId {
  @IsMongoId()
  userId: ObjectId;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  excludeIds?: Types.ObjectId[];
}
