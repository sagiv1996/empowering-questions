import { IsArray, IsString } from 'class-validator';

export class TriggerNotifications {
  @IsString()
  fcm: string;

  @IsArray()
  @IsString({ each: true })
  questionsString: string[];
}
