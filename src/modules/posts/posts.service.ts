import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import {
  CreatePostDto,
  FilterPostsDto,
  ListPostDto,
  PostDto,
} from 'src/modules/posts/dto';
import { UsersService } from '../user';
import { PaginateDto } from 'src/common/dto';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schema';
import { TUserObjectMongoose } from '../user/types';

@Injectable()
export class PostsService {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel('Post') private readonly postModel: Model<Post>,
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

      await this.usersService.updateUser(new Types.ObjectId(userId), {
        postsId: [...user.postsId, newPost._id],
      });

      return plainToInstance(PostDto, newPost);
    } catch (error) {
      this.errorException(error);
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
          select: ['id', 'email', 'username', 'avatar'],
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
      this.errorException(error);
    }
  }

  async getPostById(_id: Types.ObjectId) {
    try {
      return await this.postModel.findById(_id).populate({
        path: 'userId',
        select: ['id', 'email', 'username', 'avatar'],
      });
    } catch (error) {
      this.errorException(error);
    }
  }

  async receivePost(
    postId: Types.ObjectId,
    firebaseId: string,
  ): Promise<TUserObjectMongoose> {
    try {
      const user = await this.usersService.getUserByUid(firebaseId);

      const userUpdate = await this.usersService.updateUser(user.id, {
        postsReceive: [...user.postsReceive, postId],
      });

      return await userUpdate.populate('postsReceive');
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error: unknown) {
    console.log(new Date());
    console.error(error);
    throw new InternalServerErrorException();
  }
}
