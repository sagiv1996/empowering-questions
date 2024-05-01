import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class SendPushNotificationsDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsMongoId({ each: true })
  usersIds: Types.ObjectId[];
}
