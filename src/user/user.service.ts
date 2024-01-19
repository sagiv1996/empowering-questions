import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user';
import { UpserteUser as UpsertUser } from './dto/upsert-user.dto';
import { GetUserById } from './dto/get-user-by-id.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async upsertUser(upsertUser: UpsertUser): Promise<User> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          firebaseId: upsertUser.firebaseId,
        },
        {
          firebaseId: upsertUser.firebaseId,
          frequency: upsertUser.frequency,
          gender: upsertUser.gender,
          categories: upsertUser.categories,
        },
        { upsert: true, new: true },
      );

      return user;
    } catch (e) {
      throw e;
    }
  }

  async getUserById(getUserById: GetUserById) {
    const user = await this.userModel.findById(getUserById.userId).lean();
    return user;
  }

  async getAll() {
    const users = await this.userModel.find();
    return users;
  }
}
