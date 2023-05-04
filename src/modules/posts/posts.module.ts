import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostSchema } from './schema/posts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../user/user.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: 'Post', schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
