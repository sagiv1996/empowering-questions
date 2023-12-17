import { IsEnum, IsString } from 'class-validator';

enum categories {
  'confidence' = 'confidence',
  'Physical activity and nutrition' = 'Physical activity and nutrition',
  'relationship' = 'relationship',
}
export class CreateQuestion {
  @IsString()
  string: string;

  @IsEnum(categories, { each: true })
  category: categories;
}
