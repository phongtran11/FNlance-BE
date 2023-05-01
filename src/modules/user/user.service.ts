import { Injectable } from '@nestjs/common';

import { UsersRepository } from './user.repository';
import { plainToInstance } from 'class-transformer';
import { UserDto } from 'src/common/dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async createUser(userDto: UserDto): Promise<UserDto> {
    const newUser = await this.userRepository.create(userDto);
    return plainToInstance(UserDto, newUser);
  }

  async getUserByUid(uid: string): Promise<UserDto> {
    const user = this.userRepository.getByUid(uid);
    return plainToInstance(UserDto, user);
  }
}
