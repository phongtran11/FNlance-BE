import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PopulateOptions,
  Types,
  UpdateQuery,
} from 'mongoose';

import { ESortDate } from 'src/enums';
import { TOptionFilterFindMethod } from 'src/types';
import {
  Post,
  PostDocument,
  RequestsReceivePost,
  RequestsReceivePostDocument,
} from 'src/database';

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
    {
      filter,
      projection,
      queryOptions,
    }: Partial<TOptionFilterFindMethod<Post>>,
    sortDate?: ESortDate,
    populate?: PopulateOptions[],
  ) {
    if (populate) {
      return await this.postModel
        .find<PostDocument>(filter, projection, queryOptions)
        .populate(populate)
        .sort({
          createdAt: sortDate ? sortDate : ESortDate.DESC,
        });
    }

    return await this.postModel
      .find<PostDocument>(filter, projection, queryOptions)
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

  async updatePost(
    postId: Types.ObjectId,
    { $set, $addToSet }: UpdateQuery<Post>,
  ) {
    return await this.postModel.findOneAndUpdate<PostDocument>(
      { _id: postId },
      {
        $set: $set ? $set : {},
        $addToSet: $addToSet ? $addToSet : {},
      },
      {
        new: true,
      },
    );
  }

  async updateOffer(
    offerId: Types.ObjectId,
    { $set, $addToSet }: UpdateQuery<Post>,
  ) {
    return await this.requestReceivePostModel.findOneAndUpdate<RequestsReceivePostDocument>(
      { _id: offerId },
      {
        $set: $set ? $set : {},
        $addToSet: $addToSet ? $addToSet : {},
      },
      {
        new: true,
      },
    );
  }

  async createOffer(offerData: Omit<RequestsReceivePost, 'status'>) {
    const offer = await this.requestReceivePostModel.create(offerData);

    await offer.save();

    return offer;
  }

  async findOffer<T>(
    {
      filter,
      projection,
      queryOptions,
    }: Partial<TOptionFilterFindMethod<RequestsReceivePost>>,
    populateOptions?: PopulateOptions[],
  ) {
    return await this.requestReceivePostModel
      .find<RequestsReceivePostDocument>(filter, projection, queryOptions)
      .populate<T>(populateOptions);
  }
}
