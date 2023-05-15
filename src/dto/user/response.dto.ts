import { Types } from 'mongoose';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  id?: Types.ObjectId;

  @Expose()
  email: string;

  @Expose()
  username?: string;

  @Expose()
  password?: string;

  @Expose()
  firebaseId: string;

  @Expose()
  avatar: string;

  @Expose()
  customClaims?: Record<string, any>;

  @Expose()
  postsId?: Types.ObjectId[];

  @Expose()
  postsReceive?: Types.ObjectId[];

  @Expose()
  postsSendOffer?: Types.ObjectId[];

  @Expose()
  address?: string;

  @Expose()
  major?: string;

  @Expose()
  phoneNumber?: string;
}
