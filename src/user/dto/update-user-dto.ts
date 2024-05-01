import { ArrayMinSize, IsArray, IsEnum } from 'class-validator';
import { Categories } from 'src/schemas/question';
import { Frequency } from 'src/schemas/user';

export class UpdateUserDto {
  @IsEnum(Frequency)
  frequency: Frequency;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Categories, { each: true })
  categories: Categories[];
}
