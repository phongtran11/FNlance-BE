import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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
import { PaginateDto, SortDateDto, UpdateUserDto, UserDto } from 'src/dto';
import { FileSizeValidationPipe, ParseMongooseObjectID } from 'src/pipe';
import { TRequestWithToken } from 'src/types';
import { storageUploadHandle } from 'src/utils';

import { FirebaseAuthGuard } from '../auth';
import { PostsService } from '../posts';

import { UsersService } from './user.service';
import { EPostStatus } from 'src/enums';
import { PostDocument } from 'src/database';

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
      Logger.log(newUser, 'UserController_SignIn_UserNotInDB');
      return plainToInstance(UserDto, newUser);
    }
    Logger.log(userInDb, 'UserController_SignIn_UserInDB');

    return plainToInstance(UserDto, userInDb);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post')
  async getListPost(
    @Req() { user: { uid } }: { user: DecodedIdToken },
    @Query() { page, limit }: PaginateDto,
    @Query() { sortDate }: SortDateDto,
  ) {
    const postsOfUser = await this.usersService.getListPostOfUser(uid);

    postsOfUser.sort((a, b) => {
      if (sortDate === 'asc')
        return (
          new Date(a.toObject()?.createdAt).getTime() -
          new Date(b.toObject()?.createdAt).getTime()
        );

      if (sortDate === 'desc') {
        return (
          new Date(b.toObject()?.createdAt).getTime() -
          new Date(a.toObject()?.createdAt).getTime()
        );
      }
    });

    const totalPost = postsOfUser.length;
    const totalPage =
      Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

    const startIndex = (page - 1) * limit;

    return {
      posts: postsOfUser.slice(startIndex, startIndex + limit),
      totalPost,
      totalPage,
      page,
      limit,
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-receive')
  async getListPostReceive(
    @Req() { user: { uid } }: TRequestWithToken,
    @Query() { page, limit }: PaginateDto,
    @Query() { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);

    const posts = await this.postsService.getAllPost(sortDate);

    const postUserHaveRequest = posts.filter(
      (post) =>
        post.userReceived?.toString() === user._id.toString() &&
        post.status === EPostStatus.IS_RECEIVED,
    );

    const totalPost = postUserHaveRequest.length;
    const totalPage =
      Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

    const startIndex = (page - 1) * limit;

    return {
      posts: postUserHaveRequest.slice(startIndex, startIndex + limit),
      totalPost,
      totalPage,
      page,
      limit,
    };
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('profile/list-post-request')
  async getListPostRequest(
    @Req() { user: { uid } }: TRequestWithToken,
    @Query() { page, limit }: PaginateDto,
    @Query() { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);
    const userPopulated = await user.populate<{
      postsSendOffer: PostDocument[];
    }>('postsSendOffer');

    const listRequest = await this.postsService.getAllRequest();

    const requestOfUser = listRequest.filter(
      (req) => req.userId.toString() === user._id.toString(),
    );

    const postHaveRequest = userPopulated.postsSendOffer
      .sort((a: any, b: any) => {
        if (sortDate === 'asc')
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        if (sortDate === 'desc')
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      })
      .map((post) => {
        let isReturn = false;
        let myRequest;

        requestOfUser.forEach((req) => {
          if (post.id === req.postId.toString()) {
            isReturn = true;
            myRequest = req;
          }
        });

        if (!isReturn) return null;
        return { post, myRequest };
      })
      .filter(Boolean);

    const totalPost = postHaveRequest.length;
    const totalPage =
      Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

    const startIndex = (page - 1) * limit;

    return {
      posts: postHaveRequest.slice(startIndex, startIndex + limit),
      totalPost,
      totalPage,
      page,
      limit,
    };
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

    Logger.log(user, 'UserController_GetProfile');

    return plainToInstance(UserDto, user);
  }
}
