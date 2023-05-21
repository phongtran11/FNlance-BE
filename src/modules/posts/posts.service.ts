import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';

import { RequestsReceivePost, UserDocument } from 'src/database';
import { EPostStatus, ESortDate, EStatusPostReceive } from 'src/enums';
import { populateRequestReceive, populateUser } from 'src/utils';
import {
  CreatePostDto,
  PaginateDto,
  FilterPostsDto,
  ListPostDto,
  RequestReceivePostDto,
  GetListPostOfferDto,
  SortDateDto,
} from 'src/dto';

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
      postsId: [newPost._id],
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

    // update post
    const postUpdated = await this.postRepository.updatePost(postsReceive._id, {
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

    // update offer
    await this.postRepository.updateOffer(request._id, {
      $set: {
        status: EStatusPostReceive.ACCEPTED,
      },
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
        status: status ? status : { $exists: true },
      },
      projection: {},
      queryOptions: {},
    };

    if (status) optionsQuery.filter.status = status;

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
        userId: user.id,
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

    const total = await this.postRepository.countPost({
      userId: user.id,
    });

    const totalPage =
      Math.ceil(total / limit) > 1 ? Math.ceil(total / limit) : 1;

    Logger.log(
      {
        data: postsOfUser,
        total,
        totalPage,
        page,
        limit,
      },
      'PostService_ListUserPosted',
    );

    return {
      data: postsOfUser,
      total,
      totalPage,
      page,
      limit,
    };
  }

  async getListPostUserSentOffer(
    uid: string,
    { page, limit }: PaginateDto,
    { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);
    const offerOfUser = await this.postRepository.findOffer({
      filter: {
        userId: user._id,
      },
      projection: {},
      queryOptions: {},
    });

    const offersId = offerOfUser.map((offer) => offer.postId);

    const filter = {
      _id: {
        $in: offersId,
      },
    };

    const postUserSentOffer = await this.postRepository.findPost({
      filter,
      projection: {},
      queryOptions: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {
          createdAt: sortDate ? sortDate : ESortDate.DESC,
        },
      },
    });

    const total = await this.postRepository.countPost(filter);

    const postWithOffer = postUserSentOffer
      .map((post) => {
        let myRequest: Types.ObjectId;

        post.listRequest.map((req) => {
          if (
            offerOfUser.some(
              (userOffer) => userOffer._id.toString() === req._id.toString(),
            )
          )
            myRequest = req._id;
        });

        if (myRequest)
          return {
            post,
            myRequest,
          };

        return null;
      })
      .filter(Boolean);

    const totalPage =
      Math.ceil(total / limit) > 1 ? Math.ceil(total / limit) : 1;

    Logger.log(
      { data: postWithOffer, totalPage, total, page, limit },
      'PostService_PostUserSentOffer',
    );

    return { data: postWithOffer, totalPage, total, page, limit };
  }

  async getListPostUserReceived(
    uid: string,
    { page, limit }: PaginateDto,
    { sortDate }: SortDateDto,
  ) {
    const user = await this.usersService.getUserByUid(uid);
    const offerOfUser = await this.postRepository.findOffer({
      filter: {
        userId: user._id,
        status: EStatusPostReceive.ACCEPTED,
      },
      projection: {},
      queryOptions: {},
    });

    const offersId = offerOfUser.map((offer) => offer.postId);

    const filter = {
      _id: {
        $in: offersId,
      },
      status: EPostStatus.IS_RECEIVED,
    };

    const postUserSentOffer = await this.postRepository.findPost({
      filter,
      projection: {},
      queryOptions: {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {
          createdAt: sortDate ? sortDate : ESortDate.DESC,
        },
      },
    });

    const total = await this.postRepository.countPost(filter);

    const postWithOffer = postUserSentOffer
      .map((post) => {
        let myRequest: Types.ObjectId;
        let isReceived = false;

        post.listRequest.map((req) => {
          if (
            offerOfUser.some(
              (userOffer) => userOffer._id.toString() === req._id.toString(),
            )
          )
            myRequest = req._id;
        });

        if (post.userReceived.toString() === user._id.toString())
          isReceived = true;

        if (isReceived && myRequest)
          return {
            post,
            myRequest,
          };

        return null;
      })
      .filter(Boolean);

    const totalPage =
      Math.ceil(total / limit) > 1 ? Math.ceil(total / limit) : 1;

    Logger.log(
      {
        data: postWithOffer,
        total,
        totalPage,
        page,
        limit,
      },
      'PostService_PostUserSentOffer',
    );

    return {
      data: postWithOffer,
      total,
      totalPage,
      page,
      limit,
    };
  }
}
