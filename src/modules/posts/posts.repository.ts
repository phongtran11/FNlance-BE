import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions, Types } from 'mongoose';

import { Post, RequestsReceivePost } from 'src/database';
import { TOptionFilterFindMethod } from 'src/types';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Request_receive_post')
    private readonly requestReceivePostModel: Model<RequestsReceivePost>,
  ) {}

  async findPostById(_id: Types.ObjectId, populate?: PopulateOptions[]) {
    if (populate) {
      return await this.postModel.findById(_id).populate(populate);
    }

    return await this.postModel.findById(_id);
  }

  async findOfferRequestById(
    _id: Types.ObjectId,
    populate?: PopulateOptions[],
  ) {
    if (populate) {
      return await this.requestReceivePostModel
        .findById<RequestsReceivePost>(_id)
        .populate(populate);
    }

    return await this.requestReceivePostModel.findById<RequestsReceivePost>(
      _id,
    );
  }

  async findPost(
    { filter, projection, queryOptions }: TOptionFilterFindMethod<Post>,
    populate?: PopulateOptions[],
  ) {
    if (populate) {
      return await this.postModel
        .find<Post>(filter, projection, queryOptions)
        .populate(populate);
    }

    return await this.postModel.find<Post>(filter, projection, queryOptions);
  }

  async countPost(filter: FilterQuery<Post>) {
    return await this.postModel.count(filter);
  }
}
