import { IsEnum, IsString } from 'class-validator';

export enum categories {
  'confidence' = 'confidence',
  'Sport' = 'Sport',
  'relationship' = 'relationship',
}
export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(categories, { each: true })
  category: categories;
}
