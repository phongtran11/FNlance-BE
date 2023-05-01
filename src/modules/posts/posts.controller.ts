import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CreatePostDto, PostDto } from 'src/dto/posts';
import { PostsService } from './posts.service';
import { FirebaseAuthGuard } from '../auth';
import { PaginateDto } from 'src/dto';

@Controller('posts')
@UseGuards(FirebaseAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('list')
  async getListPost(@Query() paginateDto: PaginateDto) {
    return this.postsService.getList(paginateDto);
  }

  @Post('create-post')
  async newPost(@Body() createPostRequest: CreatePostDto): Promise<PostDto> {
    return await this.postsService.createPost(createPostRequest);
  }
}
