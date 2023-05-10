import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Post, RequestsReceivePost } from 'src/database';
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

import { UsersService } from '../user';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
    @InjectModel('Request_receive_post')
    private readonly requestReceivePostModel: Model<RequestsReceivePost>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async createPost({
    userId,
    title,
    description,
    tags,
    location,
    budgetFrom,
    budgetTo,
    expiredDay,
    typeOfJob,
    typeOfWork,
    workingForm,
    payForm,
  }: CreatePostDto): Promise<PostDto> {
    const user = await this.usersService.getUserById(userId);

    if (!user) {
      throw new BadRequestException("UserId isn't exists");
    }

    try {
      const newPost = new this.postModel({
        userId,
        title,
        description,
        tags,
        location,
        budget: [budgetFrom, budgetTo],
        expiredDay,
        typeOfJob,
        typeOfWork,
        workingForm,
        payForm,
      });
      await newPost.save();

      await this.usersService.updateUser(user.firebaseId, {
        postsId: [...user.postsId, newPost._id],
      });

      return plainToInstance(PostDto, newPost);
    } catch (error) {
      this.errorException(error, "Can't create post");
    }
  }

  async getListPost(
    { page, limit }: PaginateDto,
    { tag, titleSearch, ...filterPosts }: FilterPostsDto,
  ): Promise<ListPostDto> {
    try {
      const filterTag = tag ? { tags: { $in: [tag] } } : {};
      const searchTitle = titleSearch
        ? { title: { $regex: new RegExp(titleSearch, 'i') } }
        : {};
      let filter = Object.assign(filterPosts, filterTag);
      filter = Object.assign(filter, searchTitle);

      const posts = await this.postModel
        .find(
          filter,
          {},
          {
            skip: (page - 1) * limit,
            limit,
          },
        )
        .populate({
          path: 'userId',
          select: [
            'id',
            'email',
            'username',
            'avatar',
            'address',
            'phoneNumber',
          ],
        });

      const totalPost = await this.postModel.count(filter);
      const totalPage =
        Math.ceil(totalPost / limit) > 1 ? Math.ceil(totalPost / limit) : 1;

      return {
        listPost: posts,
        totalPost,
        totalPage,
        page,
        limit,
      };
    } catch (error) {
      this.errorException(error, "Can't get list post");
    }
  }

  async getPostById(_id: Types.ObjectId) {
    try {
      return await this.postModel.findById(_id).populate({
        path: 'userId',
        select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
      });
    } catch (error) {
      this.errorException(error, "Can't get post");
    }
  }

  async receivePost(
    postId: Types.ObjectId,
    firebaseId: string,
    requestId: Types.ObjectId,
  ) {
    const user = await this.usersService.getUserByUid(firebaseId);

    const postsReceive = await this.getPostById(postId);
    const request = await this.requestReceivePostModel.findById(requestId);

    if (postsReceive.status === EPostStatus.IS_RECEIVED) {
      throw new BadRequestException('Post was received ');
    }

    // update post is received
    const post = await this.updatePost(postsReceive.id, {
      status: EPostStatus.IS_RECEIVED,
      requestReceived: request ? request._id : null,
      userReceived: user._id,
      dateReceived: new Date(),
    });

    // update post received in user
    await this.usersService.updateUser(user.firebaseId, {
      postsReceive: [...user.postsReceive, postId],
    });

    // return post offer
    const populateUser = await post.populate({
      path: 'userId',
      select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
    });

    const populatePostReceived = await populateUser.populate('requestReceived');

    return populatePostReceived;
  }

  async updatePost(_id: Types.ObjectId, updateProp: TUpdateUserProp) {
    try {
      return await this.postModel.findOneAndUpdate(
        { _id },
        {
          $set: updateProp,
        },
        {
          new: true,
        },
      );
    } catch (error) {
      this.errorException(error, "Can't update post");
    }
  }

  async requestReceive(
    postId: Types.ObjectId,
    requestReceivePost: RequestReceivePostDto,
  ) {
    const user = await this.usersService.getUserByUid(requestReceivePost.uid);

    // update postSendOffer of User
    await this.usersService.updateUser(requestReceivePost.uid, {
      postSendOffer: [...user.postSendOffer, postId],
    });

    //  create PostSendOffer
    const request = await this.createRequestReceivePost({
      postId,
      ...requestReceivePost,
    });

    // add postSendOffer to listRequest in post
    await this.postModel.findOneAndUpdate(
      { _id: postId },
      {
        $push: {
          listRequest: request._id,
        },
      },
      {
        new: true,
      },
    );

    return request;
  }

  async createRequestReceivePost({
    uid,
    ...requestReceivePost
  }: RequestReceivePostDto & { postId: Types.ObjectId }) {
    const user = await this.usersService.getUserByUid(uid);

    const request = new this.requestReceivePostModel({
      ...requestReceivePost,
      userId: user._id,
    });

    try {
      await request.save();
      return request;
    } catch (err) {
      this.errorException(err);
    }
    await request.save();
  }

  async getRequestReceivePost(receivePostId: Types.ObjectId) {
    return await this.requestReceivePostModel.findById(receivePostId).populate({
      path: 'userId',
      select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
    });
  }

  async getListRequestReceiveDetail({ arrayId, status }: GetListPostOfferDto) {
    const listQueryPromise = arrayId.map((id) => {
      const filter =
        status === EStatusPostReceive.ALL
          ? {
              _id: id,
            }
          : {
              _id: id,
              status,
            };

      return new Promise((resolve) => {
        this.requestReceivePostModel
          .findOne(filter)
          .populate({
            path: 'userId',
            select: [
              'id',
              'email',
              'username',
              'avatar',
              'address',
              'phoneNumber',
            ],
          })
          .then((data) => {
            resolve(data);
          });
      });
    });
    const listPostOffer = await Promise.all(listQueryPromise);

    return listPostOffer.filter(Boolean);
  }

  async getAllPostPopulateListRequest() {
    return await this.postModel.find().populate('listRequest');
  }

  async getAllPost() {
    return await this.postModel.find();
  }

  async getAllRequest() {
    return await this.requestReceivePostModel.find();
  }

  private errorException(error: unknown, message?: string) {
    console.log(new Date().toLocaleString());
    console.error(error);
    throw new InternalServerErrorException(message);
  }
}
