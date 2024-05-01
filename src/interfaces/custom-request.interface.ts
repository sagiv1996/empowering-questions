import { Request } from 'express';
import { Types } from 'mongoose';

export interface customRequest extends Request {
  firebaseId?: string;
  userId?: Types.ObjectId;
}
