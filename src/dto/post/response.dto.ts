import { Exclude, Expose } from 'class-transformer';
import { Types } from 'mongoose';

import {
  EPostStatus,
  ETypeOfJob,
  ETypeOfServices,
  ETypeOfWork,
  EWorkingForm,
  EPayForm,
  EStatusPostReceive,
} from 'src/enums';

@Exclude()
class UserInPost {
  @Expose()
  email: string;
  @Expose()
  username: string;
  @Expose()
  avatar: string;
  @Expose()
  id: string;
}

@Exclude()
export class PostDto {
  @Expose()
  id: Types.ObjectId;

  @Expose()
  userId: UserInPost;

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
  typeOfServices: ETypeOfServices;

  @Expose()
  typeOfWork: ETypeOfWork;

  @Expose()
  workingForm: EWorkingForm;

  @Expose()
  payForm: EPayForm;

  @Expose()
  workingStatus: EStatusPostReceive;

  @Expose()
  dateReceived: Date;

  @Expose()
  dateFinished: Date;

  @Expose()
  listRequest: Types.ObjectId[];

  @Expose()
  requestReceived: Types.ObjectId;
}

@Exclude()
export class ListPostDto {
  @Expose()
  listPost: any[];

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

@Exclude()
export class PostDetailDto {
  @Expose()
  id: Types.ObjectId;

  @Expose()
  userId: UserInPost;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  tags: string[];

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
  typeOfServices: ETypeOfServices;

  @Expose()
  typeOfWork: ETypeOfWork;

  @Expose()
  workingForm: EWorkingForm;

  @Expose()
  payForm: EPayForm;

  @Expose()
  workingStatus: EStatusPostReceive;

  @Expose()
  dateReceived: Date;

  @Expose()
  dateFinished: Date;

  @Expose()
  requestReceived: Types.ObjectId;
}
