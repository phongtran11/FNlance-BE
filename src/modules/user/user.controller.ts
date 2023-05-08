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
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Types } from 'mongoose';

import { configuration } from 'src/config';
import { UpdateUserDto, UserDto } from 'src/dto';
import { FileSizeValidationPipe, ParseMongooseObjectID } from 'src/pipe';
import { TRequestWithToken } from 'src/types';
import { storageUploadHandle } from 'src/utils';

import { FirebaseAuthGuard } from '../auth';
import { PostsService } from '../posts';

import { UsersService } from './user.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  public async signIn(@Req() { user }: { user: DecodedIdToken }) {
    const userInDb = await this.usersService.getUserByUid(user.uid);

    if (!userInDb) {
      const newUser = await this.usersService.createUser({
        email: user.email,
        password: user.passwordSalt,
        username: user.displayName,
        firebaseId: user.uid,
        avatar: user.photoURL,
        customClaims: user.customClaims,
      });

      return plainToInstance(UserDto, newUser);
    }

    return plainToInstance(UserDto, userInDb);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post')
  async getListPost(@Req() { user: { uid } }: { user: DecodedIdToken }) {
    const postsOfUser = await this.usersService.getListPostOfUser(uid);

    return postsOfUser;
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-receive')
  async getListPostReceive(@Req() { user: { uid } }: TRequestWithToken) {
    const postsId = await this.usersService.getListPostReceiveOfUser(uid);

    const postPromise = postsId.map((post) => {
      return this.postsService.getPostById(post._id);
    });

    const postsReceive = await Promise.all(postPromise);

    return postsReceive;
  }

  @UseGuards(FirebaseAuthGuard)
  @Put('profile/update')
  async updateUser(
    @Req() req: TRequestWithToken,
    @Body() updateUser: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(req.user.uid, updateUser);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('profile/upload')
  @UseInterceptors(FileInterceptor('avatar', storageUploadHandle))
  async uploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File,
    @Req() req: TRequestWithToken,
  ) {
    const baseUrl = configuration().baseUrl;
    const avatarUrl: string = baseUrl + file.path.replace('public/', '');
    const userId = req.user.uid;

    return await this.usersService.updateUser(userId, {
      avatar: avatarUrl,
    });
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
