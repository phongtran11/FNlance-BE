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
    id: Types.ObjectId,
    propsUpdate: TPropsUpdateUser,
  ): Promise<TUserObjectMongoose> {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id },
      { $set: propsUpdate },
    );
    return user;
  }

  async getListPostOfUser(userId: Types.ObjectId) {
    const userPopulate = await this.userModel
      .findById(userId)
      .populate('postsId');

    return userPopulate.postsId;
  }

  async getListPostReceiveOfUser(userId: Types.ObjectId) {
    const userPopulate = await this.userModel
      .findById(userId)
      .populate('postsReceive');

    return userPopulate.postsReceive;
  }

  private errorException(error) {
    console.error(`[User Services]: ${new Date()}`, error);
    throw new InternalServerErrorException();
  }
}
