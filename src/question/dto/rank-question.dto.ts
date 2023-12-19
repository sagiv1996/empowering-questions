import { IsMongoId, IsNumber, Max, Min } from 'class-validator';
import { ObjectId } from 'mongoose';

export class RankQuestion {
  @IsMongoId()
  questionId: ObjectId;

  @IsMongoId()
  userId: ObjectId;

  @IsNumber()
  @Min(1)
  @Max(5)
  rank: number;
}
