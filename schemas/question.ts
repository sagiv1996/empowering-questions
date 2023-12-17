import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema()
export class Question {
  @Prop({ required: true, unique: true, type: String })
  string: string;

  @Prop({
    required: true,
    enum: ['confidence', 'Physical activity and nutrition', 'relationship'],
  })
  category: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
