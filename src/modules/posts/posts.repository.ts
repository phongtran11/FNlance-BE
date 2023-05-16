import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, Types } from 'mongoose';

import {
  Post,
  PostDocument,
  RequestsReceivePost,
  RequestsReceivePostDocument,
} from 'src/database';
import { ESortDate } from 'src/enums';
import { TOptionFilterFindMethod } from 'src/types';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Request_receive_post')
    private readonly requestReceivePostModel: Model<RequestsReceivePost>,
  ) {}

  async findPostById<T>(_id: Types.ObjectId, populate?: PopulateOptions[]) {
    if (populate) {
      return await this.postModel.findById(_id).populate<T>(populate);
    }

    return await this.postModel.findById<PostDocument>(_id);
  }

  async findOfferRequestById(
    _id: Types.ObjectId,
    populate?: PopulateOptions[],
  ) {
    if (populate) {
      return await this.requestReceivePostModel
        .findById<RequestsReceivePostDocument>(_id)
        .populate(populate);
    }

    return await this.requestReceivePostModel.findById<RequestsReceivePostDocument>(
      _id,
    );
  }

  async findPost(
    { filter, projection, queryOptions }: TOptionFilterFindMethod<Post>,
    sortDate?: ESortDate,
    populate?: PopulateOptions[],
  ) {
    if (populate) {
      return await this.postModel
        .find<Post>(filter, projection, queryOptions)
        .populate(populate)
        .sort({
          createdAt: sortDate ? sortDate : ESortDate.DESC,
        });
    }

    return await this.postModel
      .find<Post>(filter, projection, queryOptions)
      .sort({
        createdAt: sortDate ? sortDate : ESortDate.DESC,
      });
  }

  async countPost(filter: FilterQuery<Post>) {
    return await this.postModel.count(filter);
  }

  async createPost(createPostData: Post) {
    const post: PostDocument = await this.postModel.create(createPostData);

    await post.save();

    return post;
  }

  async updatePost(postId: Types.ObjectId, postUpdate: Partial<Post>) {
    return await this.requestReceivePostModel.findOneAndUpdate<PostDocument>(
      { _id: postId },
      postUpdate,
      {
        new: true,
      },
    );
  }
}
