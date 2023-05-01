import { IsOptional } from 'class-validator';
import { ToNumberFormat } from 'src/common/decorators';

export class PaginateDto {
  @IsOptional()
  @ToNumberFormat()
  page?: number = 1;

  @IsOptional()
  @ToNumberFormat()
  limit?: number = 10;
}
