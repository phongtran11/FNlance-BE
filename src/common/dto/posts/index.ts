import { Exclude, Expose } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ToDateFormat } from 'src/common/decorators';
import { EPostStatus } from 'src/common/enums';

export class CreatePostDto {
  @IsNotEmpty()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  tag: string[];

  @IsString()
  location: string;

  @IsNumber()
  budgetFrom: number;

  @IsNumber()
  budgetTo: number;

  @ToDateFormat()
  @IsDate()
  expiredDay: Date;
}

@Exclude()
export class PostDto {
  @Expose()
  id?: Types.ObjectId;

  @Expose()
  userId: Types.ObjectId;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  status?: EPostStatus;

  @Expose()
  tag: string[];

  @Expose()
  location: string;

  @Expose()
  expiredDay: Date;

  @Expose()
  budget: [number, number];
}

@Exclude()
export class ListPostDto {
  @Expose()
  listPost: PostDto[];

  @Expose()
  totalPost: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPage: number;
}
