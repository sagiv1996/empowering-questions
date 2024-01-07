import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Genders } from './user';

export enum Categories {
  'selfConfidence' = 'self confidence',
  'relationship' = 'relationship',
  'positiveFeelings' = 'positive feelings',
  'communication' = 'communication',
  'spiritualQuestions' = 'spiritual Questions',
  'career' = 'career',
  'familyLife' = 'family life',
  'universityStudies' = 'university studies',
}

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ type: String, required: true, unique: true, index: true })
  string: string;

  @Prop({
    type: String,
    required: true,
    enum: Categories,
  })
  category: Categories;

  @Prop({ type: String, required: true, enum: Genders })
  gender: Genders;

  @Prop({
    type: [
      {
        userId: { type: String, required: true, ref: 'User' },
        rank: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    default: undefined,
  })
  ranking: { userId: string; rank: number }[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
