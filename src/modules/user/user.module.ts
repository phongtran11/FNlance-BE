import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './user.controller';
import { UserSchema } from './user.schema';
import { UsersService } from './user.service';
import { UsersRepository } from './user.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
