import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

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
}

export class GetUserByUidDTO {
  @IsNotEmpty()
  id: string;
}
