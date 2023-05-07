import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User } from 'src/database';
import { UserDto } from 'src/dto';
import { TUserObjectMongoose, TPropsUpdateUser } from 'src/types';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser({
    email,
    password,
    displayName,
    firebaseId,
    avatar,
    customClaims,
  }: UserDto): Promise<TUserObjectMongoose> {
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
      this.errorException(error, 'Cant create user');
    }
  }

  async getUserByUid(uid: string): Promise<TUserObjectMongoose> {
    return await this.userModel.findOne({ firebaseId: uid });
  }

  async getUserById(id: Types.ObjectId): Promise<TUserObjectMongoose> {
    return await this.userModel.findOne({ _id: id });
  }

  async updateUser(
    uid: string,
    propsUpdate: TPropsUpdateUser,
  ): Promise<TUserObjectMongoose> {
    try {
      return await this.userModel.findOneAndUpdate(
        { firebaseId: uid },
        { $set: propsUpdate },
        {
          new: true,
        },
      );
    } catch (error) {
      this.errorException(error, 'Cant update user');
    }
  }

  async getListPostOfUser(uid: string) {
    try {
      const userPopulate = await this.userModel
        .findOne({ firebaseId: uid })
        .populate('postsId');

      if (userPopulate.postsId.length === 0) {
        return [];
      }

      return userPopulate.postsId;
    } catch (error) {
      this.errorException(error, 'Cant get list post of user');
    }
  }

  async getListPostReceiveOfUser(firebaseId: string) {
    try {
      const userPopulate = await this.userModel
        .findOne({ firebaseId })
        .populate('postsReceive');

      if (userPopulate.postsReceive.length === 0) {
        return [];
      }

      return userPopulate.postsReceive;
    } catch (error) {
      this.errorException(error, 'Cant get list post, user have received');
    }
  }

  private errorException(error, message?: string) {
    console.log(new Date().toLocaleString());
    console.log(error);

    throw new InternalServerErrorException(message);
  }
}
