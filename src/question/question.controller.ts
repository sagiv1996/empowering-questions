import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { customRequest } from 'src/interfaces/custom-request.interface';
import { Question } from 'src/schemas/question';

@UseGuards(AuthGuard)
@Controller('question')
export class QuestionController {
  constructor(
    @Inject(QuestionService) private readonly questionService: QuestionService,
  ) {}

  @Get('random')
  async findRandomQuestionsByUserId(
    @Req() req: customRequest,
    @Query('excludeIds') excludeIds?: Types.ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.findRandomQuestionByUserId(
      req.userId,
      excludeIds,
    );
  }
  @Get('random-likes')
  async randomLikesQuestionsByUserId(
    @Req() req: customRequest,
    @Query('excludeIds') excludeIds?: Types.ObjectId[],
  ): Promise<Question[]> {
    return this.questionService.randomLikesQuestionsByUserId(
      req.userId,
      excludeIds,
    );
  }

  @Get(':questionId')
  async findQuestionById(
    @Param('questionId') questionId: Types.ObjectId,
  ): Promise<Question> {
    return this.questionService.findQuestionById(questionId);
  }

  @Post('update-likes/:questionId/:action')
  async updateUserIdsLikes(
    @Req() req: customRequest,
    @Param('questionId') questionId: Types.ObjectId,
  ): Promise<Question> {
    // if (action == UserAction.ADD) {
    return this.questionService.addUserIdToUserIdsLikes(questionId, req.userId);
    // }
    // return this.questionService.removeUserIdToUserIdsLikes(questionId, userId);
  }

  @Get(':questionId/count-likes')
  async countUsersLikes(
    @Param('questionId') questionId: Types.ObjectId,
  ): Promise<number> {
    return this.questionService.countUsersLikes(questionId);
  }
}
