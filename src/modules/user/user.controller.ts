import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { GetUserByUidDTO } from 'src/common/dto';
import { UsersService } from './user.service';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getUserProfile(@Query() { uid }: GetUserByUidDTO) {
    return await this.usersService.getUserByUid(uid);
  }
}
