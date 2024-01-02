import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Categories, } from 'src/schemas/question';
import { Genders } from 'src/schemas/user';

export class GetRandomQuestion {
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
}
