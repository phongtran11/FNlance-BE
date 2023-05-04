import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { UsersService } from './user.service';
import { ParseMongooseObjectID } from 'src/common';
import { Types } from 'mongoose';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UserDto } from './dto';
import { FirebaseService } from '../firebase';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  public async signIn(@Req() { user }: { user: DecodedIdToken }) {
    let userFounded = await this.usersService.getUserByUid(user.uid);

    if (!userFounded) {
      const userInFirebase = await this.firebaseService.getUserByUid(user.uid);

      const newUser = await this.usersService.createUser({
        email: userInFirebase.email,
        password: userInFirebase.passwordSalt,
        displayName: userInFirebase.displayName,
        firebaseId: userInFirebase.uid,
        avatar: userInFirebase.photoURL,
        customClaims: userInFirebase.customClaims,
      });

      userFounded = newUser;
    }

    return plainToInstance(UserDto, userFounded);
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseMongooseObjectID) id: Types.ObjectId) {
    const user = await this.usersService.getUserById(id);

    if (!user) {
      throw new NotFoundException("User's not found");
    }

    return plainToInstance(UserDto, user);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/:id/list-post')
  async getListPost(
    @Param('id', ParseMongooseObjectID) userId: Types.ObjectId,
  ) {
    return await this.usersService.getListPostOfUser(userId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/:id/list-post-receive')
  async getListPostReceive(
    @Param('id', ParseMongooseObjectID) userId: Types.ObjectId,
  ) {
    return await this.usersService.getListPostReceiveOfUser(userId);
  }
}
