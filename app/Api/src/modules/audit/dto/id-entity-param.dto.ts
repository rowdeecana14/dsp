import { IsString, IsUUID } from 'class-validator';

export class AuditEntityParamsDto {
  @IsString()
  entity!: string;

  @IsUUID()
  id!: string;
}

export class AuditIdParamDto {
  @IsUUID()
  id!: string;
}
