import { IsEnum, IsOptional } from 'class-validator';
import { ToNumberFormat } from 'src/decorators';
import { ESortDate } from 'src/enums';

export class PaginateDto {
  @IsOptional()
  @ToNumberFormat()
  page?: number = 1;

  @IsOptional()
  @ToNumberFormat()
  limit?: number = 10;
}

export class SortDateDto {
  @IsOptional()
  @IsEnum(ESortDate)
  sortDate?: ESortDate;
}
