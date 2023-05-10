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
import { EPostStatus } from 'src/enums';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  public async signIn(
    @Req() { user }: { user: DecodedIdToken & { name?: string } },
  ) {
    const userInDb = await this.usersService.getUserByUid(user.uid);

    if (!userInDb) {
      const newUser = await this.usersService.createUser({
        email: user.email,
        password: user.passwordSalt,
        username: user.displayName ?? user.name,
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

    return postsOfUser.sort(
      (postbefore: any, postafter: any) =>
        postafter.createdAt - postbefore.createdAt,
    );
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-receive')
  async getListPostReceive(@Req() { user: { uid } }: TRequestWithToken) {
    const user = await this.usersService.getUserByUid(uid);

    const posts = await this.postsService.getAllPost();

    const postUserHaveRequest = posts.filter(
      (post) =>
        post.userReceived?.toString() === user._id.toString() &&
        post.status === EPostStatus.IS_RECEIVED,
    );

    return postUserHaveRequest;
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-request')
  async getListPostRequest(@Req() { user: { uid } }: TRequestWithToken) {
    const user = await this.usersService.getUserByUid(uid);

    const posts = await this.postsService.getAllPost();

    const listRequest = await this.postsService.getAllRequest();

    const requestOfUser = listRequest.filter(
      (req) => req.userId.toString() === user._id.toString(),
    );

    const postHaveRequest = posts.map((post) => {
      let isReturn = false;
      let myRequest;
      for (const request of requestOfUser) {
        myRequest = post.listRequest.find(
          (req) => req._id.toString() === request._id.toString(),
        );

        if (myRequest) isReturn = true;
      }

      if (isReturn) return { post, myRequest };
    });

    return postHaveRequest.filter(Boolean);
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
