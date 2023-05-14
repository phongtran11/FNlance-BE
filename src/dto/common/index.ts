import { IsEnum, IsOptional } from 'class-validator';
import { ToNumberFormat } from 'src/decorators';

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
  @IsEnum({
    asc: 'asc',
    desc: 'desc',
  })
  sortDate?: 'asc' | 'desc' = 'asc';
}
