import { IsEnum, IsString } from 'class-validator';
import { ObjectId } from 'mongoose';
import { Frequency } from 'src/schemas/user';

export class CreateUser {
  @IsString()
  firebaseId: string;

  @IsEnum(Frequency, { each: true })
  frequency: Frequency;
}
