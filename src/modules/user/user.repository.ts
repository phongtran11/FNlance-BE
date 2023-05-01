import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDto } from 'src/dto';
import { User } from './user.schema';
import { UserError } from './user.error';
import { TUserQueryByMongoose } from './types';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async create({
    email,
    password,
    displayName,
    firebaseId,
    avatar,
    customClaims,
  }: UserDto): Promise<TUserQueryByMongoose> {
    try {
      const newUser = new this.userModel({
        displayName,
        password,
        email,
        firebaseId,
        avatar,
        customClaims,
      });
      await newUser.save();

      return newUser;
    } catch (error) {
      this.errorException(error);
    }
  }

  async getByUid(uid: string): Promise<TUserQueryByMongoose> {
    try {
      const user = await this.userModel.findOne({ firebaseId: uid });
      return user;
    } catch (error) {
      this.errorException(error);
    }
  }

  async getById(_id: string): Promise<TUserQueryByMongoose> {
    try {
      const user = await this.userModel.findOne({ _id });
      return user;
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error) {
    const err = new UserError(error);
    console.error(err);
    throw new InternalServerErrorException();
  }
}
