import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Categories } from './question';

export type UserDocument = HydratedDocument<User>;

export enum Frequency {
  'little' = 'little',
  'normal' = 'normal',
  'extra' = 'extra',
}

export enum Genders {
  'male' = 'male',
  'female' = 'female',
}
@Schema()
export class User {
  @Prop({ type: String, required: true, unique: true, index: true })
  firebaseId: string;

  @Prop({ type: String, enum: Frequency, required: true })
  frequency: Frequency;

  @Prop({ type: [Date] })
  historyLogin: [Date];

  @Prop({ type: String, required: true, enum: Genders })
  gender: Genders;

  @Prop({
    type: [String],
    required: true,
    enum: Categories,
  })
  categories: [Categories];
}

export const UserSchema = SchemaFactory.createForClass(User);