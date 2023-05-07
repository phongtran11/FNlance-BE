import { IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { EUserMajor } from 'src/enums';

export class GetUserByUidDTO {
  @IsNotEmpty()
  id: string;
}

export class UpdateUserDto {
  @IsOptional()
  username: string;

  @IsOptional()
  address: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(EUserMajor, { each: true })
  major: EUserMajor[];

  @IsOptional()
  phoneNumber: string;
}
