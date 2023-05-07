import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserSchema } from 'src/database';

import { PostsModule } from '../posts';

import { UsersController } from './user.controller';
import { UsersService } from './user.service';

@Module({
  imports: [
    forwardRef(() => PostsModule),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
