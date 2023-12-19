import { IsEnum, IsString } from 'class-validator';
import { categories } from 'schemas/question';

export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(categories, { each: true })
  category: categories;
}
