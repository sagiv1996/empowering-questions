import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { Categories } from 'src/schemas/question';
import { Genders } from 'src/schemas/user';

export class FindRandomQuestion {
  @IsArray()
  @IsEnum(Genders, { each: true })
  gender: Genders;

  @IsArray()
  @IsEnum(Categories, { each: true })
  categories: Categories[];

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  size?: number = 1;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  excludeIds?: Types.ObjectId[];
}
