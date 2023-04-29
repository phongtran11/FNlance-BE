import { Controller, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/firebase.guard';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  //
  @Get()
  tryGuard() {
    return 'success';
  }
}
