import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsOptional()
  displayName?: string;

  @IsOptional()
  password?: string;

  @IsString()
  firebaseId: string;

  @IsString()
  avatar: string;

  @IsOptional()
  customClaims?: Record<string, any>;
}
