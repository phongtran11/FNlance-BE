import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post } from './posts.schema';
import { CreatePostDto, PostDto } from 'src/dto/posts';
import { PaginateDto } from 'src/dto';
import { TUserQueryByMongoose } from './types';
import { PostsError } from './posts.error';

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
  }: CreatePostDto): Promise<TUserQueryByMongoose> {
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

  async getList({ page, limit }: PaginateDto): Promise<TUserQueryByMongoose[]> {
    try {
      const list = await this.postModel.find({}, undefined, {
        limit: 10,
        skip: (page - 1) * limit,
      });

      return list;
    } catch (error) {
      this.errorException(error);
    }
  }

  async countDocument(filter: Record<keyof PostDto, any> | object) {
    return await this.postModel.count(filter);
  }

  private errorException(error) {
    const err = new PostsError(error);
    Logger.error('PostRepository ' + new Date().toISOString() + err);
    throw new InternalServerErrorException();
  }
}
