import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class GetUsersByIds {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  usersIds?: Types.ObjectId[];
}
