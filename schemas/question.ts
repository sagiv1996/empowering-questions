import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum categories {
  'confidence' = 'confidence',
  'Sport' = 'Sport',
  'relationship' = 'relationship',
}
export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ required: true, unique: true, type: String })
  string: string;

  @Prop({
    type: String,
    required: true,
    enum: categories,
  })
  category: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
