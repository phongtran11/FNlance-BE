import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './user.controller';
import { UserSchema } from './user.schema';
import { UsersService } from './user.service';
import { FirebaseModule } from '../firebase';
import { PostsModule } from '../posts';

@Module({
  imports: [
    forwardRef(() => PostsModule),
    FirebaseModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
