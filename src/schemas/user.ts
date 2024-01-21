import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Categories } from './question';
import { Field, ID, ObjectType } from '@nestjs/graphql';

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
@ObjectType()
@Schema()
export class User {
  @Field(() => ID!)
  _id: ObjectId;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true, index: true })
  firebaseId: String;

  @Prop({ type: String, required: true, unique: true })
  fcm: string;

  @Field(() => Frequency)
  @Prop({ type: String, enum: Frequency, required: true })
  frequency: Frequency;

  @Field(() => Genders)
  @Prop({ type: String, required: true, enum: Genders })
  gender: Genders;

  @Field(() => [Categories])
  @Prop({
    type: [String],
    required: true,
    enum: Categories,
  })
  categories: [Categories];
}

export const UserSchema = SchemaFactory.createForClass(User);
