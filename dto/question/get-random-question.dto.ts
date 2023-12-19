import { Transform } from 'class-transformer';
import { IsArray, IsEnum } from 'class-validator';
import { Categories, Genders } from 'schemas/question';

export class GetRandomQuestion {
  @IsArray()
  @IsEnum(Genders, { each: true })
  gender: Genders;

  @IsArray()
  @IsEnum(Categories, { each: true })
  categories: Categories[];
}
