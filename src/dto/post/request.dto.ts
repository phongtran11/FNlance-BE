import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Types, isValidObjectId } from 'mongoose';

import { ToArrayFormat, ToDateFormat, ToMongoObjectId } from 'src/decorators';
import {
  ETypeOfJob,
  ETypeOfWork,
  ETypeOfServices,
  EWorkingForm,
  EPayForm,
  EPostStatus,
  EStatusPostReceive,
} from 'src/enums';

export class CreatePostDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsArray()
  tags: string[];

  @IsString()
  location: string;

  @IsNumber()
  budgetFrom: number;

  @IsNumber()
  budgetTo: number;

  @ToDateFormat()
  @IsDate()
  expiredDay: Date;

  @IsEnum(ETypeOfJob)
  typeOfJob: ETypeOfJob;

  @IsEnum(ETypeOfWork)
  typeOfWork: ETypeOfWork;

  @IsEnum(ETypeOfServices)
  typeOfServices?: ETypeOfServices;

  @IsEnum(EWorkingForm)
  workingForm: EWorkingForm;

  @IsEnum(EPayForm)
  @IsOptional()
  payForm: EPayForm;
}

export class FilterPostsDto {
  @IsOptional()
  tag?: string;

  @IsEnum(EPostStatus)
  @IsOptional()
  status?: EPostStatus;

  @IsEnum(ETypeOfJob)
  @IsOptional()
  typeOfJob?: ETypeOfJob;

  @IsEnum(EWorkingForm)
  @IsOptional()
  workingForm?: EWorkingForm;

  @IsEnum(ETypeOfWork)
  @IsOptional()
  typeOfWork?: ETypeOfWork;

  @IsEnum(EPayForm)
  @IsOptional()
  payForm?: EPayForm;

  @IsOptional()
  titleSearch?: string;

  @IsOptional()
  @IsEnum(ETypeOfServices)
  typeOfServices?: ETypeOfServices;

  @IsOptional()
  @IsEnum({
    asc: 'asc',
    desc: 'desc',
  })
  sortDate?: 'asc' | 'desc';
}

export class RequestReceivePostDto {
  @IsOptional()
  uid?: string;

  @IsString()
  proposalSkill: string;

  @IsNumber()
  recommendCost: number;

  @IsString()
  phoneNumber: string;

  @ToDateFormat()
  @IsDate()
  expectDateDone: Date;
}

export class GetListPostOfferDto {
  // Array id of post offer
  @ToArrayFormat()
  @IsArray()
  arrayId: Types.ObjectId[];

  @IsEnum(EStatusPostReceive)
  status: EStatusPostReceive;
}
