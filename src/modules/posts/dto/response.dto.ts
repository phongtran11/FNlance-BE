import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';
import {
  EPostStatus,
  ETypeOfJob,
  ETypeOfWork,
  EWorkingForm,
  EPayForm,
  EStatusPostReceive,
} from '../enum';

@Exclude()
export class PostDto {
  @Expose()
  id: Types.ObjectId;

  @Expose()
  userId: Types.ObjectId;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  tag: string[];

  @Expose()
  location: string;

  @Expose()
  expiredDay: Date;

  @Expose()
  budget: [number, number];

  @Expose()
  status: EPostStatus;

  @Expose()
  typeOfJob: ETypeOfJob;

  @Expose()
  typeOfWork: ETypeOfWork;

  @Expose()
  workingForm: EWorkingForm;

  @Expose()
  payForm: EPayForm;
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

@Exclude()
export class PostReceiveDto {
  @Expose()
  userId: Types.ObjectId;

  @Expose()
  postId: Types.ObjectId;

  @Expose()
  dateReceive: Date;

  @Expose()
  dateDone: Date;

  @Expose()
  statusPostReceive: EStatusPostReceive;
}
