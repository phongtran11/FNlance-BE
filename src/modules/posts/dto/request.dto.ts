import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';
import { ToDateFormat } from 'src/common/decorators';

import { PaginateDto } from '../../../common/dto/common';
import {
  ETypeOfJob,
  ETypeOfWork,
  EWorkingForm,
  EPayForm,
  EPostStatus,
} from '../enum';

export class CreatePostDto {
  @IsNotEmpty()
  userId: Types.ObjectId;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty()
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

  @IsEnum(EWorkingForm)
  workingForm: EWorkingForm;

  @IsEnum(EPayForm)
  payForm: EPayForm;
}

export class GetListPostOfTagDto extends PaginateDto {
  @IsNotEmpty()
  tags: string[];
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
}
