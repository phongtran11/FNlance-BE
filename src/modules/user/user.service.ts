import { Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

import { User } from 'src/database';
import { TUserFromFirebase } from 'src/types';

import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(user: TUserFromFirebase) {
    const userInDb = await this.getUserByUid(user.uid);

    if (!userInDb) {
      const newUser = await this.userRepository.createUser(user);
      Logger.log(newUser, 'UserService_CreateUser_UserNotInDb');
      return newUser;
    }

    Logger.log(userInDb, 'UserService_CreateUser_UserInDB');

    return userInDb;
  }

  async getUserByUid(uid: string) {
    const user = await this.userRepository.findByUid(uid);

    Logger.log(user, 'UserService_GetUserByUid');

    return user;
  }

  async getUserById(id: Types.ObjectId) {
    const user = await this.userRepository.findById(id);

    Logger.log(user, 'UserService_GetUserById');

    return user;
  }

  async updateUser(uid: string, updateUserData: Partial<User>) {
    const updateData = {
      $set: {},
      $addToSet: {},
    };

    for (const [key, value] of Object.entries(updateUserData)) {
      if (key === 'major') {
        updateData.$set = { ...updateData.$set, [key]: value };
      } else if (Array.isArray(value)) {
        updateData.$addToSet = {
          ...updateData.$addToSet,
          [key]: { $each: value },
        };
      } else {
        updateData.$set = { ...updateData.$set, [key]: value };
      }
    }

    const userUpdated = await this.userRepository.updateUser(uid, updateData);

    Logger.log(userUpdated, 'UserService_UpdateUser');

    return userUpdated;
  }
}
