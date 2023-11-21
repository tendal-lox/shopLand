import { InjectModel } from '@nestjs/mongoose';
import { Users } from '../schema/user';
import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserRepository {
  private logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<Users>,
  ) {}

  async creation(query: any): Promise<Users> {
    try {
      const createdUser = new this.userModel(query);
      return createdUser.save();
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async findAll(query: any) {
    try {
      return await this.userModel.find(query);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async findOne(query: any) {
    try {
      return this.userModel.findOne(query);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  updateOne(query: any, data: any) {
    return this.userModel.updateOne(query, { $set: data });
  }
}
