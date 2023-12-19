import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum Categories {
  'confidence' = 'confidence',
  'sport' = 'sport',
  'relationship' = 'relationship',
}

export enum Genders {
  'male' = 'male',
  'female' = 'female',
}
export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ required: true, unique: true, type: String })
  string: string;

  @Prop({
    type: String,
    required: true,
    enum: Categories,
  })
  category: string;

  @Prop({ type: String, required: true, enum: Genders })
  gender: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
