import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user';
import { CreateUser } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUser: CreateUser): Promise<User> {
    try {
      const user = await this.userModel.create({
        firebaseId: createUser.firebaseId,
        frequency: createUser.frequency,
        gender: createUser.gender,
        categories: createUser.categories,
      });
      return user;
    } catch (e) {
      throw e;
    }
  }

  async getAll() {
    const users = await this.userModel.find();
    return users;
  }
}