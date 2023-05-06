import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { UsersService } from './user.service';
import { configuration, ParseMongooseObjectID } from 'src/common';
import { Types } from 'mongoose';
import { DecodedIdToken } from 'firebase-admin/auth';
import { UpdateUserRequestDto, UserDto } from './dto';
import { FirebaseService } from '../firebase';
import { plainToInstance } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from '../../common/pipe/validateFilePipe.pipe';
import { diskStorage } from 'multer';
import * as path from 'path';

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

      userFounded = await this.usersService.createUser({
        email: userInFirebase.email,
        password: userInFirebase.passwordSalt,
        displayName: userInFirebase.displayName,
        firebaseId: userInFirebase.uid,
        avatar: userInFirebase.photoURL,
        customClaims: userInFirebase.customClaims,
      });
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

  @UseGuards(FirebaseAuthGuard)
  @Put('profile/update')
  async updateUser(@Req() req, @Body() updateUser: UpdateUserRequestDto) {
    return await this.usersService.updateUser(req.user.id, updateUser);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('profile/upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/profile-images',
        filename: (req, file, cb) => {
          const filename: string =
            path.parse(file.originalname).name.replace(/\s/g, '') +
            Date.now() +
            Math.round(Math.random() * 1e9);
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File,
    @Req() req,
  ) {
    const baseUrl = configuration().baseUrl;
    const avatarUrl: string = baseUrl + file.path.replace('public/', '');
    const userId = req.user.id;

    return await this.usersService.updateUser(userId, { avatar: avatarUrl });
  }
}
