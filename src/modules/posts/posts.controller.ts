import {
  Body,
  Controller,
  Get,
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
  PostDetailDto,
  GetListPostOfferDto,
} from 'src/dto';
import { ParseMongooseObjectID, ParseMongooseObjectIDToArray } from 'src/pipe';

import { FirebaseAuthGuard } from '../auth';

import { PostsService } from './posts.service';
import { plainToInstance } from 'class-transformer';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('list')
  async getListPost(
    @Query() paginateDto: PaginateDto,
    @Query() filterPosts: FilterPostsDto,
  ) {
    return await this.postsService.getListPost(paginateDto, filterPosts);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('request-receive-detail')
  async getRequestReceiveDetail(
    @Query(ParseMongooseObjectIDToArray)
    getListPostOfferQuery: GetListPostOfferDto,
  ) {
    return this.postsService.getListRequestReceiveDetail(getListPostOfferQuery);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('create-post')
  async newPost(@Body() createPostRequest: CreatePostDto): Promise<PostDto> {
    return await this.postsService.createPost(createPostRequest);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':postId/receive')
  async receivePost(
    @Req() { user }: { user: DecodedIdToken },
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
    @Body('requestId', ParseMongooseObjectID) requestId: Types.ObjectId,
  ) {
    return await this.postsService.receivePost(postId, user.uid, requestId);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post(':postId/request-receive')
  async requestReceivePost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
    @Body() requestReceivePost: RequestReceivePostDto,
  ) {
    return await this.postsService.requestReceive(postId, requestReceivePost);
  }

  @Get(':postId')
  async getPost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  ) {
    const post = await this.postsService.getPostById(postId);

    if (!post) throw new NotFoundException("Post's not found");

    const postPopulateListRequest = await post.populate('listRequest');

    const mappingRequestsWithUser = postPopulateListRequest.listRequest.map(
      (request) => this.postsService.getRequestReceivePost(request._id),
    );

    const listRequestPopulate = await Promise.all(mappingRequestsWithUser);

    const { listRequest, ...postObject } = postPopulateListRequest.toObject();

    return {
      ...plainToInstance(PostDetailDto, postObject),
      listRequest: listRequest ? listRequestPopulate : [],
    };
  }
}
