import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { PostsRepository } from './posts.repository';
import { CreatePostDto, ListPostDto, PostDto } from 'src/dto/posts';
import { UsersRepository } from '../user';
import { PaginateDto } from 'src/dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostDto> {
    const newPost = await this.postsRepository.createPost(createPostDto);
    const user = await this.usersRepository.getById(createPostDto.userId);

    try {
      user.postsId = [...user.postsId, newPost.id];
      await user.save();
    } catch (error) {
      Logger.error('PostServices ' + new Date().toISOString() + error);
    }

    return plainToInstance(PostDto, newPost);
  }

  async getList(paginateDto: PaginateDto): Promise<ListPostDto> {
    const list = await this.postsRepository.getList(paginateDto);
    const totalPost = await this.postsRepository.countDocument({});
    const totalPage =
      totalPost / paginateDto.limit < 1
        ? 1
        : Math.ceil(totalPost / paginateDto.limit);

    return plainToInstance(ListPostDto, {
      listPost: list,
      page: paginateDto.page,
      limit: paginateDto.limit,
      totalPost,
      totalPage,
    });
  }
}
