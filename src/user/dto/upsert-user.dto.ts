import { IsArray, IsEnum, IsString } from 'class-validator';
import { Categories } from 'src/schemas/question';
import { Frequency, Genders } from 'src/schemas/user';

export class UpserteUser {
  @IsString()
  firebaseId: string;

  @IsString()
  fcm: string;

  @IsEnum(Frequency, { each: true })
  frequency: Frequency;

  @IsEnum(Genders, { each: true })
  gender: Genders;

  @IsArray({ each: true })
  @IsEnum(Categories, { each: true })
  categories: Categories[];
}
