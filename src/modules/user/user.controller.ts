import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
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
import { TRequestWithToken, TUserFromFirebase } from 'src/types';
import { storageUploadHandle } from 'src/utils';

import { FirebaseAuthGuard } from '../auth';
import { PostsService } from '../posts';

import { UsersService } from './user.service';
import { EPostStatus } from 'src/enums';
import { PostDocument } from 'src/database';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  public async signIn(@Req() { user }: Request & TUserFromFirebase) {
    try {
      const newUser = await this.usersService.createUser(user);
      return plainToInstance(UserDto, newUser);
    } catch (error) {
      Logger.error(error, 'UserController_SignIn');
      throw new InternalServerErrorException();
    }
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseMongooseObjectID) id: Types.ObjectId) {
    try {
      const user = await this.usersService.getUserById(id);

      if (!user) {
        throw new NotFoundException('User is not found !');
      }

      return plainToInstance(UserDto, user);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('update')
  @HttpCode(200)
  async updateUser(
    @Req() req: TRequestWithToken,
    @Body() updateUser: UpdateUserDto,
  ) {
    try {
      return await this.usersService.updateUser(req.user.uid, updateUser);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('avatar', storageUploadHandle))
  async uploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File,
    @Req() { user }: TRequestWithToken,
  ) {
    try {
      const avatarUrl: string =
        configuration().baseUrl + file.path.replace('public/', '');
      return await this.usersService.updateUser(user.uid, {
        avatar: avatarUrl,
      });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // @UseGuards(FirebaseAuthGuard)
  // @Get('profile/list-post')
  // async getListPost(
  //   @Req() { user: { uid } }: { user: DecodedIdToken },
  //   @Query() { page, limit }: PaginateDto,
  //   @Query() { sortDate }: SortDateDto,
  // ) {
  //   const postsOfUser = await this.usersService.getListPostOfUser(uid);

  //   postsOfUser.sort((a, b) => {
  //     if (sortDate === 'asc')
  //       return (
  //         new Date(a.toObject()?.createdAt).getTime() -
  //         new Date(b.toObject()?.createdAt).getTime()
  //       );

  //     if (sortDate === 'desc') {
  //       return (
  //         new Date(b.toObject()?.createdAt).getTime() -
  //         new Date(a.toObject()?.createdAt).getTime()
  //       );
  //     }
  //   });

  //   const totalPost = postsOfUser.length;
  //   const totalPage =
  //     Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

  //   const startIndex = (page - 1) * limit;

  //   return {
  //     posts: postsOfUser.slice(startIndex, startIndex + limit),
  //     totalPost,
  //     totalPage,
  //     page,
  //     limit,
  //   };
  // }

  // @UseGuards(FirebaseAuthGuard)
  // @Get('profile/list-post-receive')
  // async getListPostReceive(
  //   @Req() { user: { uid } }: TRequestWithToken,
  //   @Query() { page, limit }: PaginateDto,
  //   @Query() { sortDate }: SortDateDto,
  // ) {
  //   const user = await this.usersService.getUserByUid(uid);

  //   const posts = await this.postsService.getAllPost(sortDate);

  //   const postUserHaveRequest = posts.filter(
  //     (post) =>
  //       post.userReceived?.toString() === user._id.toString() &&
  //       post.status === EPostStatus.IS_RECEIVED,
  //   );

  //   const totalPost = postUserHaveRequest.length;
  //   const totalPage =
  //     Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

  //   const startIndex = (page - 1) * limit;

  //   return {
  //     posts: postUserHaveRequest.slice(startIndex, startIndex + limit),
  //     totalPost,
  //     totalPage,
  //     page,
  //     limit,
  //   };
  // }

  // @UseGuards(FirebaseAuthGuard)
  // @Get('profile/list-post-request')
  // async getListPostRequest(
  //   @Req() { user: { uid } }: TRequestWithToken,
  //   @Query() { page, limit }: PaginateDto,
  //   @Query() { sortDate }: SortDateDto,
  // ) {
  //   const user = await this.usersService.getUserByUid(uid);
  //   const userPopulated = await user.populate<{
  //     postsSendOffer: PostDocument[];
  //   }>('postsSendOffer');

  //   const listRequest = await this.postsService.getAllRequest();

  //   const requestOfUser = listRequest.filter(
  //     (req) => req.userId.toString() === user._id.toString(),
  //   );

  //   const postHaveRequest = userPopulated.postsSendOffer
  //     .sort((a: any, b: any) => {
  //       if (sortDate === 'asc')
  //         return (
  //           new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  //         );

  //       if (sortDate === 'desc')
  //         return (
  //           new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  //         );
  //     })
  //     .map((post) => {
  //       let isReturn = false;
  //       let myRequest;

  //       requestOfUser.forEach((req) => {
  //         if (post.id === req.postId.toString()) {
  //           isReturn = true;
  //           myRequest = req;
  //         }
  //       });

  //       if (!isReturn) return null;
  //       return { post, myRequest };
  //     })
  //     .filter(Boolean);

  //   const totalPost = postHaveRequest.length;
  //   const totalPage =
  //     Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

  //   const startIndex = (page - 1) * limit;

  //   return {
  //     posts: postHaveRequest.slice(startIndex, startIndex + limit),
  //     totalPost,
  //     totalPage,
  //     page,
  //     limit,
  //   };
  // }
}
