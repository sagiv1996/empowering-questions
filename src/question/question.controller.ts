import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Question } from 'schemas/question';
import { CreateQuestion } from 'dto/question/create-question.dto';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  create(@Body() createQuestion: CreateQuestion): Promise<Question> {
    try {
      return this.questionService.create(createQuestion);
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @Get()
  findAll(): Promise<Question[]> {
    return this.questionService.findAll();
  }
}
