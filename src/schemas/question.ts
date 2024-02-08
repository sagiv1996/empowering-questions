import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';
import { Genders } from './user';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

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

@ObjectType()
@Schema()
export class Question {
  @Field(() => ID!)
  _id: ObjectId;

  @Field()
  @Prop({ type: String, required: true, unique: true, index: true })
  string: string;

  @Field(() => Categories)
  @Prop({
    type: String,
    required: true,
    enum: Categories,
  })
  category: Categories;

  @Field(() => Genders)
  @Prop({ type: String, required: true, enum: Genders })
  gender: Genders;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
