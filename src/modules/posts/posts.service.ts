import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Post,
  RequestsReceivePost,
  RequestsReceivePostSchema,
  UserDocument,
} from 'src/database';
import {
  CreatePostDto,
  PostDto,
  PaginateDto,
  FilterPostsDto,
  ListPostDto,
  RequestReceivePostDto,
  GetListPostOfferDto,
} from 'src/dto';
import { EPostStatus, EStatusPostReceive } from 'src/enums';
import { TUpdateUserProp } from 'src/types';
import { populateUser } from 'src/utils';

import { UsersService } from '../user';
import { PostRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly postRepository: PostRepository,
  ) {}

  async createPost({
    budgetFrom,
    budgetTo,
    userId,
    ...createPostData
  }: CreatePostDto) {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new BadRequestException("UserId isn't exists");
    }

    const newPost = await this.postRepository.createPost({
      ...createPostData,
      userId,
      budget: [budgetFrom, budgetTo],
    });

    await this.usersService.updateUser(user.firebaseId, {
      postsId: newPost._id,
    });

    Logger.log(newPost, 'PostService_CreatePost');

    return newPost;
  }

  async getListPost(
    { page, limit }: PaginateDto,
    { tag, titleSearch, sortDate, ...filterPosts }: FilterPostsDto,
  ): Promise<ListPostDto> {
    const filterTag = tag ? { tags: { $in: tag } } : {};

    const searchTitle = titleSearch
      ? { title: { $regex: new RegExp(titleSearch, 'i') } }
      : {};

    let filter = Object.assign(filterPosts, filterTag);
    filter = Object.assign(filter, searchTitle);

    const options = {
      filter,
      projection: {},
      queryOptions: {
        skip: (page - 1) * limit,
        limit,
      },
    };

    const posts = await this.postRepository.findPost(options, sortDate);

    const totalPost = await this.postRepository.countPost(filter);
    const totalPage =
      Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

    Logger.log(
      {
        listPost: posts,
        totalPost,
        totalPage,
        page,
        limit,
      },
      'PostService_GetListPost',
    );

    return {
      listPost: posts,
      totalPost,
      totalPage,
      page,
      limit,
    };
  }

  async getPostById(id: Types.ObjectId) {
    const post = await this.postRepository.findPostById<{
      userId: UserDocument;
    }>(id, [populateUser()]);

    Logger.log(post, 'PostService_GetPostById');

    return post;
  }

  // async getPostById(_id: Types.ObjectId) {
  //   try {
  //     return await this.postModel.findById(_id).populate({
  //       path: 'userId',
  //       select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
  //     });
  //   } catch (error) {
  //     this.errorException(error, "Can't get post");
  //   }
  // }

  // async receivePost(
  //   postId: Types.ObjectId,
  //   firebaseId: string,
  //   requestId: Types.ObjectId,
  // ) {
  //   const user = await this.usersService.getUserByUid(firebaseId);

  //   const postsReceive = await this.getPostById(postId);
  //   const request = await this.requestReceivePostModel.findById(requestId);

  //   await request.updateOne(
  //     {
  //       $set: {
  //         status: EStatusPostReceive.ACCEPTED,
  //       },
  //     },
  //     {
  //       new: true,
  //     },
  //   );

  //   if (postsReceive.status === EPostStatus.IS_RECEIVED) {
  //     throw new BadRequestException('Post was received ');
  //   }

  //   // update post is received
  //   const post = await this.updatePost(postsReceive.id, {
  //     status: EPostStatus.IS_RECEIVED,
  //     requestReceived: request ? request._id : null,
  //     userReceived: request.userId,
  //     dateReceived: new Date(),
  //   });

  //   // update post received in user
  //   await this.usersService.updateUser(user.firebaseId, {
  //     postsReceive: [...user.postsReceive, postId],
  //   });

  //   // return post offer
  //   const populateUser = await post.populate({
  //     path: 'userId',
  //     select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
  //   });

  //   const populatePostReceived = await populateUser.populate('requestReceived');

  //   return populatePostReceived;
  // }

  // async updatePost(_id: Types.ObjectId, updateProp: TUpdateUserProp) {
  //   try {
  //     return await this.postModel.findOneAndUpdate(
  //       { _id },
  //       {
  //         $set: updateProp,
  //       },
  //       {
  //         new: true,
  //       },
  //     );
  //   } catch (error) {
  //     this.errorException(error, "Can't update post");
  //   }
  // }

  // async requestReceive(
  //   postId: Types.ObjectId,
  //   requestReceivePost: RequestReceivePostDto,
  // ) {
  //   const user = await this.usersService.getUserByUid(requestReceivePost.uid);

  //   // Detect is user send offer with this post
  //   const post = await this.postModel
  //     .findById(postId)
  //     .populate<{ listRequest: RequestsReceivePost[] }>('listRequest');

  //   const isUserHasRequestThisPost = post.listRequest.some(
  //     (request) => request.userId.toString() === user._id.toString(),
  //   );

  //   if (isUserHasRequestThisPost)
  //     throw new BadRequestException('You have requested offer for this post');

  //   // update postSendOffer of User
  //   await this.usersService.updateUser(requestReceivePost.uid, {
  //     postsSendOffer: [...user.postsSendOffer, postId],
  //   });

  //   //  create PostSendOffer
  //   const request = await this.createRequestReceivePost({
  //     postId,
  //     ...requestReceivePost,
  //   });

  //   // add postSendOffer to listRequest in post
  //   await this.postModel.findOneAndUpdate(
  //     { _id: postId },
  //     {
  //       $push: {
  //         listRequest: request._id,
  //       },
  //     },
  //     {
  //       new: true,
  //     },
  //   );

  //   return request;
  // }

  // async createRequestReceivePost({
  //   uid,
  //   ...requestReceivePost
  // }: RequestReceivePostDto & { postId: Types.ObjectId }) {
  //   const user = await this.usersService.getUserByUid(uid);

  //   const request = new this.requestReceivePostModel({
  //     ...requestReceivePost,
  //     userId: user._id,
  //   });

  //   try {
  //     await request.save();
  //     return request;
  //   } catch (err) {
  //     this.errorException(err);
  //   }
  //   await request.save();
  // }

  // async getRequestReceivePost(receivePostId: Types.ObjectId) {
  //   return await this.requestReceivePostModel.findById(receivePostId).populate({
  //     path: 'userId',
  //     select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
  //   });
  // }

  // async getListRequestReceiveDetail({ arrayId, status }: GetListPostOfferDto) {
  //   const listQueryPromise = arrayId.map((id) => {
  //     const filter =
  //       status === EStatusPostReceive.ALL
  //         ? {
  //             _id: id,
  //           }
  //         : {
  //             _id: id,
  //             status,
  //           };

  //     return new Promise((resolve) => {
  //       this.requestReceivePostModel
  //         .findOne(filter)
  //         .populate({
  //           path: 'userId',
  //           select: [
  //             'id',
  //             'email',
  //             'username',
  //             'avatar',
  //             'address',
  //             'phoneNumber',
  //           ],
  //         })
  //         .then((data) => {
  //           resolve(data);
  //         });
  //     });
  //   });
  //   const listPostOffer = await Promise.all(listQueryPromise);

  //   return listPostOffer.filter(Boolean);
  // }

  // async getAllPostPopulateListRequest() {
  //   return await this.postModel
  //     .find()
  //     .populate<{ listRequest: RequestsReceivePost[] }>('listRequest');
  // }

  // async getAllPost(sortOrder?: 'asc' | 'desc') {
  //   if (sortOrder) {
  //     return await this.postModel.find().sort({
  //       createdAt: sortOrder,
  //     });
  //   }

  //   return await this.postModel.find();
  // }

  // async getAllRequest() {
  //   return await this.requestReceivePostModel.find<RequestsReceivePostSchema>();
  // }

  // private errorException(error: unknown, message?: string) {
  //   console.log(new Date().toLocaleString());
  //   console.error(error);
  //   throw new InternalServerErrorException(message);
  // }
}
