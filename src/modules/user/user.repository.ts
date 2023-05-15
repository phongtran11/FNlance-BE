import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { User, UserDocument } from 'src/database';
import { TUserFromFirebase } from 'src/types';

@Injectable()
export class UserRepository {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser(user: TUserFromFirebase) {
    const newUser = await this.userModel.create({
      email: user.email,
      password: user.passwordSalt,
      username: user.displayName ?? user.name,
      firebaseId: user.uid,
      avatar: user.photoURL ?? user.picture,
      customClaims: user.customClaims,
    });

    await newUser.save();

    return newUser;
  }

  async findByUid(firebaseId: string) {
    return await this.userModel.findOne<UserDocument>({
      firebaseId,
    });
  }

  async findById(id: Types.ObjectId) {
    return await this.userModel.findById<UserDocument>(id);
  }

  async updateUser(firebaseId: string, { $set, $push }: UpdateQuery<User>) {
    return await this.userModel.findOneAndUpdate<UserDocument>(
      { firebaseId },
      {
        $set: $set ? $set : {},
        $push: $push ? $push : {},
      },
      { new: true },
    );
  }
}
