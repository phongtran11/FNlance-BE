import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

import { RequestsReceivePost, UserDocument } from 'src/database';
import {
  CreatePostDto,
  PaginateDto,
  FilterPostsDto,
  ListPostDto,
  RequestReceivePostDto,
  GetListPostOfferDto,
  SortDateDto,
} from 'src/dto';
import { EPostStatus, ESortDate } from 'src/enums';
import { populateRequestReceive, populateUser } from 'src/utils';

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

  async receivePost(
    postId: Types.ObjectId,
    requestId: Types.ObjectId,
    firebaseId: string,
  ) {
    const postsReceive = await this.getPostById(postId);
    const request = await this.postRepository.findOfferRequestById(requestId);

    if (postsReceive.status === EPostStatus.IS_RECEIVED)
      throw new BadRequestException('Post was receive');

    // update request
    const postUpdated = await this.postRepository.updatePost(request._id, {
      $set: {
        status: EPostStatus.IS_RECEIVED,
        requestReceived: request ? request._id : null,
        userReceived: request.userId,
        dateReceived: new Date(),
      },
    });

    // update post received in user
    const user = await this.usersService.getUserByUid(firebaseId);
    await this.usersService.updateUser(user.firebaseId, {
      postsReceive: [postId],
    });

    const postPopulate = await postUpdated.populate([
      populateUser(),
      populateRequestReceive(),
    ]);

    Logger.log(postPopulate, 'PostService_ReceivePost');

    return postPopulate;
  }

  async requestReceive(
    postId: Types.ObjectId,
    { uid, ...res }: RequestReceivePostDto,
  ) {
    // Detect is user send offer with this post

    const user = await this.usersService.getUserByUid(uid);

    const post = await this.postRepository.findPostById<{
      listRequest: RequestsReceivePost[];
    }>(postId, [
      {
        path: 'listRequest',
      },
    ]);

    const isUserHasRequestThisPost = post.listRequest.some(
      (request: RequestsReceivePost | Types.ObjectId) => {
        const receiveRequest = request as RequestsReceivePost;
        return receiveRequest.userId.toString() === user._id.toString();
      },
    );

    if (isUserHasRequestThisPost)
      throw new BadRequestException('You have requested offer for this post');

    // update postSendOffer of User
    await this.usersService.updateUser(uid, {
      postsSendOffer: [postId],
    });

    //  create PostSendOffer
    const request = await this.postRepository.createOffer({
      postId,
      userId: user._id,
      ...res,
    });

    // add postSendOffer to listRequest in post
    await this.postRepository.updatePost(postId, {
      $addToSet: {
        listRequest: request._id,
      },
    });

    Logger.log(request, 'PostService_RequestOffer');

    return request;
  }

  async getOffersDetail({ arrayId, status }: GetListPostOfferDto) {
    const optionsQuery = {
      filter: {
        _id: {
          $in: arrayId,
        },
        status: status ? status : {},
      },
      projection: {},
      queryOptions: {},
    };

    const listOffer = await this.postRepository.findOffer<{
      userId: UserDocument;
    }>(optionsQuery, [populateUser()]);

    Logger.log(listOffer, 'PostService_ListOffer');

    return listOffer;
  }

  async getListUserPosted(
    uid: string,
    { page, limit }: PaginateDto,
    { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);

    const postsOfUser = await this.postRepository.findPost({
      filter: {
        userId: user._id,
      },
      projection: {},
      queryOptions: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {
          createdAt: sortDate,
        },
      },
    });

    Logger.log(postsOfUser, 'PostService_ListUserPosted');

    return postsOfUser;
  }

  async getListPostUserSentOffer(
    uid: string,
    { page, limit }: PaginateDto,
    { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);

    const offerOfUser = await this.postRepository.findOffer({
      filter: {
        userId: user.firebaseId,
      },
      projection: {},
      queryOptions: {},
    });

    const offersId = offerOfUser.map((offer) => offer.postId);

    const postUserSentOffer = await this.postRepository.findPost({
      filter: {
        _id: {
          $in: offersId,
        },
      },
      projection: {},
      queryOptions: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {
          createdAt: sortDate ? sortDate : ESortDate.DESC,
        },
      },
    });

    Logger.log(postUserSentOffer, 'PostService_PostUserSentOffer');

    return postUserSentOffer;
  }
}
