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
    const userInDb = await this.usersService.getUserByUid(user.uid);

    if (!userInDb) {
      const userInFirebase = await this.firebaseService.getUserByUid(user.uid);

      const newUser = await this.usersService.createUser({
        email: userInFirebase.email,
        password: userInFirebase.passwordSalt,
        displayName: userInFirebase.displayName,
        firebaseId: userInFirebase.uid,
        avatar: userInFirebase.photoURL,
        customClaims: userInFirebase.customClaims,
      });

      return plainToInstance(UserDto, newUser);
    }

    return plainToInstance(UserDto, userInDb);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post')
  async getListPost(@Req() { user: { uid } }: { user: DecodedIdToken }) {
    return await this.usersService.getListPostOfUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-receive')
  async getListPostReceive(@Req() { user: { uid } }: { user: DecodedIdToken }) {
    return await this.usersService.getListPostReceiveOfUser(uid);
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('profile/update')
  async updateUser(@Req() req, @Body() updateUser: UpdateUserRequestDto) {
    return await this.usersService.updateUser(req.user.uid, updateUser);
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

  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseMongooseObjectID) id: Types.ObjectId) {
    const user = await this.usersService.getUserById(id);

    if (!user) {
      throw new NotFoundException("User's not found");
    }

    return plainToInstance(UserDto, user);
  }
}
