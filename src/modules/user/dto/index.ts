import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { EUserMajor } from '../enum';

@Exclude()
export class UserDto {
  @Expose()
  id?: Types.ObjectId;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsOptional()
  displayName?: string;

  @Expose()
  @IsOptional()
  password?: string;

  @Expose()
  @IsString()
  firebaseId: string;

  @Expose()
  @IsString()
  avatar: string;

  @Expose()
  @IsOptional()
  customClaims?: Record<string, any>;

  @Expose()
  postsId?: Types.ObjectId[];

  @Expose()
  postsReceive?: Types.ObjectId[];

  @Expose()
  address?: string;

  @Expose()
  major?: string;

  @Expose()
  phoneNumber?: string;
}

export class GetUserByUidDTO {
  @IsNotEmpty()
  id: string;
}

export class UpdateUserRequestDto {
  @IsOptional()
  username: string;

  @IsOptional()
  address: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(EUserMajor, { each: true })
  major: EUserMajor[];

  @IsOptional()
  phoneNumber: string;
}
