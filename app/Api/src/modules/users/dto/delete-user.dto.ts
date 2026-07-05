import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class DeleteUserDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsString({ each: true })
  permissions?: string[];
}
