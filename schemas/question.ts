import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { categories } from 'dto/question/create-question.dto';
import { HydratedDocument } from 'mongoose';

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
