import { IsEnum, IsString } from 'class-validator';
import { categories, genders } from 'schemas/question';

export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(categories, { each: true })
  category: categories;

  @IsEnum(genders, { each: true })
  gender: genders;
}
