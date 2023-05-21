import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';

import { configuration } from 'src/config';
import { UpdateUserDto, UserDto } from 'src/dto';
import { FileSizeValidationPipe, ParseMongooseObjectID } from 'src/pipe';
import { TRequestWithToken, TUserFromFirebase } from 'src/types';
import { storageUploadHandle } from 'src/utils';

import { FirebaseAuthGuard } from '../auth';

import { UsersService } from './user.service';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(FirebaseAuthGuard)
  @Post('sign-in')
  @HttpCode(200)
  public async signIn(@Req() { user }: Request & TUserFromFirebase) {
    try {
      const newUser = await this.usersService.createUser(user);
      return plainToInstance(UserDto, newUser);
    } catch (error) {
      this.errorException(error);
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('update')
  @HttpCode(201)
  async updateUser(
    @Req() req: TRequestWithToken,
    @Body() updateUser: UpdateUserDto,
  ) {
    try {
      return await this.usersService.updateUser(req.user.uid, updateUser);
    } catch (error) {
      this.errorException(error);
      throw new InternalServerErrorException();
    }
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('avatar', storageUploadHandle))
  async uploadFile(
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File,
    @Req() { user }: TRequestWithToken,
  ) {
    try {
      const avatarUrl: string =
        configuration().baseUrl + file.path.replace('public/', '');

      return await this.usersService.updateUser(user.uid, {
        avatar: avatarUrl,
      });
    } catch (error) {
      this.errorException(error);
    }
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id', ParseMongooseObjectID) id: Types.ObjectId) {
    try {
      const user = await this.usersService.getUserById(id);

      if (!user) {
        throw new NotFoundException('User is not found !');
      }

      return plainToInstance(UserDto, user);
    } catch (error) {
      this.errorException(error);
    }
  }

  private errorException(error) {
    Logger.error(error);
    console.log(error);
    throw new InternalServerErrorException();
  }
}
