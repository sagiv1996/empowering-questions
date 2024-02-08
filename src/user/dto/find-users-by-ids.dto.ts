import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class FindUsersByIds {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  usersIds?: Types.ObjectId[];
}
