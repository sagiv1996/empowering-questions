import { IsEnum, IsString } from 'class-validator';
import { Categories } from 'src/schemas/question';
import { Genders } from 'src/schemas/user';

export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(Categories, { each: true })
  category: Categories;

  @IsEnum(Genders, { each: true })
  gender: Genders;
}
