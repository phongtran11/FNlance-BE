import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { DecodedIdToken } from 'firebase-admin/auth';

import {
  PaginateDto,
  FilterPostsDto,
  CreatePostDto,
  PostDto,
  RequestReceivePostDto,
  GetListPostOfferDto,
} from 'src/dto';
import { ParseMongooseObjectID, ParseMongooseObjectIDToArray } from 'src/pipe';

import { FirebaseAuthGuard } from '../auth';

import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // @UseGuards(FirebaseAuthGuard)
  // @Get('request-receive-detail')
  // async getRequestReceiveDetail(
  //   @Query(ParseMongooseObjectIDToArray)
  //   getListPostOfferQuery: GetListPostOfferDto,
  // ) {
  //   return this.postsService.getListRequestReceiveDetail(getListPostOfferQuery);
  // }

  @UseGuards(FirebaseAuthGuard)
  @Post('create-post')
  async newPost(@Body() createPostData: CreatePostDto) {
    try {
      return await this.postsService.createPost(createPostData);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Get('list')
  async getListPost(
    @Query() paginateDto: PaginateDto,
    @Query() filterPosts: FilterPostsDto,
  ) {
    try {
      return await this.postsService.getListPost(paginateDto, filterPosts);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  // @UseGuards(FirebaseAuthGuard)
  // @Post(':postId/receive')
  // async receivePost(
  //   @Req() { user }: { user: DecodedIdToken },
  //   @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  //   @Body('requestId', ParseMongooseObjectID) requestId: Types.ObjectId,
  // ) {
  //   return await this.postsService.receivePost(postId, user.uid, requestId);
  // }

  // @UseGuards(FirebaseAuthGuard)
  // @Post(':postId/request-receive')
  // async requestReceivePost(
  //   @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  //   @Body() requestReceivePost: RequestReceivePostDto,
  // ) {
  //   return await this.postsService.requestReceive(postId, requestReceivePost);
  // }

  // @Get(':postId')
  // async getPost(
  //   @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  // ) {
  //   try {
  //     return await this.postsService.getPostByIdV2(postId);
  //   } catch (error) {
  //     this.errorException(error);
  //   }
  // }

  // private errorException(error: unknown) {
  //   Logger.error(`[Post Controller]: ${error}`);
  //   console.error(error);
  //   throw new InternalServerErrorException();
  // }
}
