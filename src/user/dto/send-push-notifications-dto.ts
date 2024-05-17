import { ArrayMinSize, IsArray, IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class SendPushNotificationsDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsMongoId({ each: true })
  @IsOptional()
  usersIds?: Types.ObjectId[];
}
