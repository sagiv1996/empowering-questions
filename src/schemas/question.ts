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

  @Prop({
    type: [
      {
        userId: { type: String, required: true, ref: 'User' },
        rank: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    default: [],
  })
  ranking: { userId: string; rank: number }[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
