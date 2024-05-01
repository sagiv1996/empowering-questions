import { IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class FindQuestionsDto {
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  excludeIds?: Types.ObjectId[];
}
