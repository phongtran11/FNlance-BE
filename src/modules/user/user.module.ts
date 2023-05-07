import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './user.controller';
import { UserSchema } from './user.schema';
import { UsersService } from './user.service';
import { FirebaseModule } from '../firebase';
import { PostSchema } from '../posts/schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Post', schema: PostSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
