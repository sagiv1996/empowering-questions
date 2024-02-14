import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Question } from 'src/schemas/question';

export class TriggerNotifications {
  @IsString()
  fcm: string;


  @IsArray()
  @ValidateNested({ each: true })
  @Type(()=>Question)
  questions: Question[];
}
