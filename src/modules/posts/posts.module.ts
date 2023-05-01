import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostSchema } from './posts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'post', schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
