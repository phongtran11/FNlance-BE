import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { DecodedIdToken } from 'firebase-admin/auth';

import { ParseMongooseObjectID, ParseMongooseObjectIDToArray } from 'src/pipe';
import {
  PaginateDto,
  FilterPostsDto,
  CreatePostDto,
  RequestReceivePostDto,
  GetListPostOfferDto,
  SortDateDto,
} from 'src/dto';

import { FirebaseAuthGuard } from '../auth';

import { PostsService } from './posts.service';
import { TRequestWithToken } from 'src/types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('create-post')
  async newPost(@Body() createPostData: CreatePostDto) {
    try {
      return await this.postsService.createPost(createPostData);
    } catch (error) {
      this.errorException(error);
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
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('list/user-posted')
  async getListUserPosted(
    @Req() { user: { uid } }: TRequestWithToken,
    @Query() paginateDto: PaginateDto,
    @Query() sortDateDto: SortDateDto,
  ) {
    try {
      return await this.postsService.getListUserPosted(
        uid,
        paginateDto,
        sortDateDto,
      );
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('list/posts-user-sent-offer')
  async getListUserSent(
    @Req() { user: { uid } }: TRequestWithToken,
    @Query() paginateDto: PaginateDto,
    @Query() sortDateDto: SortDateDto,
  ) {
    try {
      return await this.postsService.getListPostUserSentOffer(
        uid,
        paginateDto,
        sortDateDto,
      );
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('list/posts-user-have-receive')
  async getListUserReceived(
    @Req() { user: { uid } }: TRequestWithToken,
    @Query() paginateDto: PaginateDto,
    @Query() sortDateDto: SortDateDto,
  ) {
    try {
      return await this.postsService.getListPostUserReceived(
        uid,
        paginateDto,
        sortDateDto,
      );
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('offer-detail')
  async getRequestReceiveDetail(
    @Query(ParseMongooseObjectIDToArray)
    getListPostOfferQuery: GetListPostOfferDto,
  ) {
    try {
      return await this.postsService.getOffersDetail(getListPostOfferQuery);
    } catch (error) {
      this.errorException(error);
    }
  }

  @Get(':postId')
  async getPost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  ) {
    try {
      return await this.postsService.getPostById(postId);
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':postId/receive-offer')
  async receivePost(
    @Req() { user }: { user: DecodedIdToken },
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
    @Body('requestId', ParseMongooseObjectID) requestId: Types.ObjectId,
  ) {
    try {
      return await this.postsService.receivePost(postId, requestId, user.uid);
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':postId/send-offer')
  @HttpCode(204)
  async requestReceivePost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
    @Body() requestReceivePost: RequestReceivePostDto,
  ) {
    try {
      await this.postsService.requestReceive(postId, requestReceivePost);
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error) {
    Logger.error(error);
    console.log(error);
    throw new InternalServerErrorException();
  }
}
