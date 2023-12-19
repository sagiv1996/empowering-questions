import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum Frequency {
  'little' = 'little',
  'normal' = 'normal',
  'extra' = 'extra',
}

@Schema()
export class User {
  @Prop({ type: String, required: true })
  firebaseId: string;

  @Prop({ type: String, enum: Frequency, required: true })
  frequency: Frequency;

  @Prop({ type: [Date] })
  historyLogin: [Date];
}

export const UserSchema = SchemaFactory.createForClass(User);
