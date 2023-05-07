import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { UserDto } from './dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema';
import { TPropsUpdateUser, TUserObjectMongoose } from './types';

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
      this.errorException(error);
    }
  }

  async getUserByUid(uid: string): Promise<TUserObjectMongoose> {
    try {
      return await this.userModel.findOne({ firebaseId: uid });
    } catch (error) {
      this.errorException(error);
    }
  }

  async getUserById(id: Types.ObjectId): Promise<TUserObjectMongoose> {
    try {
      return await this.userModel.findOne({ _id: id });
    } catch (error) {
      this.errorException(error);
    }
  }

  async updateUser(
    uid: string,
    propsUpdate: TPropsUpdateUser,
  ): Promise<TUserObjectMongoose> {
    return await this.userModel.findOneAndUpdate(
      { firebaseId: uid },
      { $set: propsUpdate },
      {
        new: true,
      },
    );
  }

  async getListPostOfUser(uid: string) {
    try {
      const userPopulate = await this.userModel
        .findOne({ firebaseId: uid })
        .populate('postsId');

      if (userPopulate.postsId.length === 0) {
        return [];
      }

      return userPopulate;
    } catch (error) {
      console.log(new Date().toLocaleString());
      console.log(error);
    }
  }

  async getListPostReceiveOfUser(uid: string) {
    try {
      const userPopulate = await this.userModel
        .findOne({ firebaseId: uid })
        .populate('postsReceive');
      console.log(userPopulate);
      if (userPopulate.postsReceive.length === 0) {
        return [];
      }

      return userPopulate.postsReceive;
    } catch (error) {
      console.log(new Date().toLocaleString());
      console.log(error);
    }
  }

  private errorException(error) {
    console.error(`[User Services]: ${new Date()}`, error);
    throw new InternalServerErrorException();
  }
}
