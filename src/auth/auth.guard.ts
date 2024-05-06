import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let firebaseId: string;
    if (process?.env?.NODE_ENV?.trim() === 'development') {
      firebaseId = process.env.USER_UID_FOR_TESTING;
      Logger.log('Running on test mode', AuthGuard.name);
      Logger.log(`firebaseId ${firebaseId}`, AuthGuard.name);
    } else {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      const { uid } = await admin.auth().verifyIdToken(token);
      firebaseId = uid;
    }
    if (
      firebaseId &&
      request.method === 'POST' &&
      request.originalUrl === '/user'
    ) {
      request['firebaseId'] = firebaseId;
      return true;
    }
    const user = await this.userService.findUserIdByFirebaseId(firebaseId);
    if (!user) {
      throw new UnauthorizedException();
    }
    request['userId'] = user._id;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
