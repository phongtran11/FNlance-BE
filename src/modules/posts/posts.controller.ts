import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CreatePostDto, PostDto } from 'src/common/dto/posts';
import { PostsService } from './posts.service';
import { FirebaseAuthGuard } from '../auth';
import { PaginateDto } from 'src/common/dto';
import { ParseMongooseObjectID } from 'src/common/pipe/parseIdToMongoObjetId.pipe';
import { Types } from 'mongoose';

@Controller('posts')
@UseGuards(FirebaseAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('list')
  async getListPost(@Query() paginateDto: PaginateDto) {
    return this.postsService.getList(paginateDto);
  }

  @Get(':postId')
  async getPost(
    @Param('postId', ParseMongooseObjectID) postId: Types.ObjectId,
  ): Promise<PostDto> {
    return this.postsService.getPostById(postId);
  }

  @Post('create-post')
  async newPost(@Body() createPostRequest: CreatePostDto): Promise<PostDto> {
    return await this.postsService.createPost(createPostRequest);
  }
}
