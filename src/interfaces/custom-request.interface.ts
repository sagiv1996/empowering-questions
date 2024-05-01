import { Request } from 'express';
import { Types } from 'mongoose';

// Extending Express Request interface to include firebaseId and userId fields
export interface customRequest extends Request {
  firebaseId?: string;
  userId?: Types.ObjectId;
}
