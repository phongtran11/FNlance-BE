import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';

import { CreateUserDTO } from 'src/dto';
import { User } from './user.model';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel('user') private readonly userModel: Model<User>) {}

  async createUser({
    email,
    password,
    displayName,
    firebaseId,
    avatar,
    customClaims,
  }: CreateUserDTO): Promise<User> {
    displayName = displayName.toLowerCase() ?? '';

    const newUser = new this.userModel({
      displayName,
      password,
      email,
      firebaseId,
      avatar,
      customClaims,
    });
    await newUser.save();

    return plainToInstance(User, newUser);
  }

  async getUserByEmail(email: string): Promise<User> {
    email = email.toLowerCase();
    const user = await this.userModel.findOne({ email });
    return plainToInstance(User, user);
  }
}
