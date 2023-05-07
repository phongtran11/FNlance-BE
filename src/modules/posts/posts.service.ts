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

import { Post } from 'src/database';
import {
  CreatePostDto,
  PostDto,
  PaginateDto,
  FilterPostsDto,
  ListPostDto,
} from 'src/dto';
import { EPostStatus } from 'src/enums';
import { TUserObjectMongoose, TUpdateUserProp } from 'src/types';

import { UsersService } from '../user';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel('Post') private readonly postModel: Model<Post>,
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
      const searchTitle = titleSearch ? { title: { $regex: titleSearch } } : {};
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
  ): Promise<TUserObjectMongoose> {
    const user = await this.usersService.getUserByUid(firebaseId);

    const postsReceive = await this.getPostById(postId);

    if (postsReceive.status === EPostStatus.IS_RECEIVED) {
      throw new BadRequestException('Post was received ');
    }

    const post = await this.updatePost(postsReceive.id, {
      status: EPostStatus.IS_RECEIVED,
    });

    await this.usersService.updateUser(user.firebaseId, {
      postsReceive: [...user.postsReceive, postId],
    });

    return await post.populate({
      path: 'userId',
      select: ['id', 'email', 'username', 'avatar', 'address', 'phoneNumber'],
    });
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

  private errorException(error: unknown, message?: string) {
    console.log(new Date().toLocaleString());
    console.error(error);
    throw new InternalServerErrorException(message);
  }
}
