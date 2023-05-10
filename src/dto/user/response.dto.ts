import { Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@Exclude()
export class UserDto {
  @Expose()
  id?: Types.ObjectId;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsOptional()
  username?: string;

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
  PostSendOffer?: Types.ObjectId[];

  @Expose()
  address?: string;

  @Expose()
  major?: string;

  @Expose()
  phoneNumber?: string;
}
