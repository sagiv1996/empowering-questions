import { IsEnum, IsString } from 'class-validator';
import { Categories, Genders } from 'src/schemas/question';

export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(Categories, { each: true })
  category: Categories;

  @IsEnum(Genders, { each: true })
  gender: Genders;
}
