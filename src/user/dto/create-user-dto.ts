import { ArrayMinSize, IsArray, IsEnum, IsString } from 'class-validator';
import { Categories } from 'src/schemas/question';
import { Frequency, Genders } from 'src/schemas/user';

export class CreateUserDto {
  @IsString()
  fcm: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsEnum(Genders)
  gender: Genders;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Categories, { each: true })
  categories: Categories[];
}
