import {
  Controller,
  Get,
  Inject,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { Types } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { customRequest } from 'src/interfaces/custom-request.interface';

@UseGuards(AuthGuard)
@Controller('question')
export class QuestionController {
  constructor(
    @Inject(QuestionService) private readonly questionService: QuestionService,
  ) {}

  @Get('random-questions')
  async findRandomQuestionsByUserId(
    @Req() req: customRequest,
    @Query('excludeIds') excludeIds?: Types.ObjectId[],
  ) {
    return this.questionService.findRandomQuestionsByUserId(
      req.userId,
      excludeIds,
    );
  }
  @Get('random-likes')
  async randomLikesQuestionsByUserId(
    @Req() req: customRequest,
    @Query('excludeIds') excludeIds?: Types.ObjectId[],
  ) {
    return this.questionService.randomLikesQuestionsByUserId(
      req.userId,
      excludeIds,
    );
  }

  @Get(':questionId')
  async findQuestionById(@Param('questionId') questionId: Types.ObjectId) {
    return this.questionService.findQuestionById(questionId);
  }

  @Put('update-likes/:questionId/:action')
  async updateUserIdsLikes(
    @Req() req: customRequest,
    @Param('questionId') questionId: Types.ObjectId,
    @Param('action') action: String,
  ) {
    if (action == 'add') {
      return this.questionService.addUserIdToUserIdsLikes(
        questionId,
        req.userId,
      );
    }
    return this.questionService.removeUserIdToUserIdsLikes(
      questionId,
      req.userId,
    );
  }

  @Get(':questionId/count-likes')
  async countUsersLikes(@Param('questionId') questionId: Types.ObjectId) {
    return this.questionService.countUsersLikes(questionId);
  }
}
