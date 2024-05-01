import {
  Controller,
  Post,
  Put,
  Get,
  Req,
  UseGuards,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/schemas/user';
import { customRequest } from 'src/interfaces/custom-request.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { SendPushNotificationsDto } from './dto/send-push-notifications-dto';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Req() req: customRequest,
  ): Promise<User> {
    return this.userService.createUser(req.firebaseId, createUserDto);
  }

  @Put()
  async updateUser(
    @Req() req: customRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(req.userId, updateUserDto);
  }

  @Get()
  async findUserById(@Req() req: customRequest): Promise<User> {
    return this.userService.findUserById(req.userId);
  }

  @Post('push-notifications')
  async createSendPushNotificationsForUsers(
    @Body() sendPushNotificationsDto: SendPushNotificationsDto,
  ) {
    this.userService.createSendPushNotificationsForUsers(
      sendPushNotificationsDto,
    );
  }
}
