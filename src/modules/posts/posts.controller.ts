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

import { CreatePostDto, FilterPostsDto, PostDto } from 'src/modules/posts/dto';
import { PostsService } from './posts.service';
import { FirebaseAuthGuard } from '../auth/firebase.guard';
import { PaginateDto } from 'src/common/dto';
import { ParseMongooseObjectID } from 'src/common';
import { Types } from 'mongoose';
import { DecodedIdToken } from 'firebase-admin/auth';

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

  @Get(':postId')
  async getPost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  ) {
    const post = await this.postsService.getPostById(postId);

    if (!post) throw new NotFoundException("Post's not found");

    return post;
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
  ) {
    return await this.postsService.receivePost(postId, user.uid);
  }
}
