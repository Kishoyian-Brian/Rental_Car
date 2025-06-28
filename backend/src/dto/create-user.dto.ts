import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.CUSTOMER;
}
