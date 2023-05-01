import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post } from './posts.schema';
import { CreatePostDto, PostDto } from 'src/common/dto/posts';
import { PaginateDto } from 'src/common/dto';
import { TPostQueryByMongoose } from './types';
import { PostsError } from './posts.error';
import {
  countPostPipeline,
  findAllPostPipeline,
  findPostByIdPipeline,
} from './posts.aggregate';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel('post') private readonly postModel: Model<Post>) {}

  async createPost({
    userId,
    title,
    description,
    tag,
    location,
    budgetFrom,
    budgetTo,
    expiredDay,
  }: CreatePostDto): Promise<TPostQueryByMongoose> {
    try {
      const newPost = new this.postModel({
        userId,
        title,
        description,
        tag,
        location,
        budget: [budgetFrom, budgetTo],
        expiredDay,
      });
      await newPost.save();

      return newPost;
    } catch (error) {
      this.errorException(error);
    }
  }

  async getList({ page, limit }: PaginateDto): Promise<PostDto[]> {
    try {
      const getListPostAggregate = findAllPostPipeline(page, limit);
      const listPost = await this.postModel.aggregate<PostDto>(
        getListPostAggregate,
      );

      return listPost;
    } catch (error) {
      this.errorException(error);
    }
  }

  async countDocument(filter?: { key: keyof PostDto; value: any }) {
    const countAggregate = countPostPipeline(filter);

    const countResult = await this.postModel.aggregate<{ count: number }>(
      countAggregate,
    );

    return countResult[0].count;
  }

  async getPostById(postId: Types.ObjectId): Promise<PostDto> {
    try {
      const findPostPipeline = findPostByIdPipeline(postId);
      const postResult = await this.postModel.aggregate<PostDto>(
        findPostPipeline,
      );

      return postResult[0];
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error: unknown) {
    Logger.error(`PostRepository ${new Date().toISOString()} ${error}`);
    throw new InternalServerErrorException();
  }
}
