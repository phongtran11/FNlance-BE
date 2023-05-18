import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PostSchema, RequestsReceivePostSchema } from 'src/database';

import { UsersModule } from '../user';

import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostRepository } from './posts.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Request_receive_post', schema: RequestsReceivePostSchema },
    ]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostRepository],
  exports: [PostsService],
})
export class PostsModule {}
