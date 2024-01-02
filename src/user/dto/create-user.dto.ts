import { IsArray, IsEnum, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Categories } from 'src/schemas/question';
import { Frequency, Genders } from 'src/schemas/user';

export class CreateUser {
  @IsString()
  firebaseId: string;

  @IsEnum(Frequency, { each: true })
  frequency: Frequency;

  @IsEnum(Genders, { each: true })
  gender: Genders;

  @IsArray({ each: true })
  @IsEnum(Categories, { each: true })
  categories: Categories[];
}
