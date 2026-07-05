import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AuditConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ignoredEntities?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ignoredActions?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedFields?: string[] = [];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1024)
  maxPayloadSize?: number = 20 * 1024;
}
