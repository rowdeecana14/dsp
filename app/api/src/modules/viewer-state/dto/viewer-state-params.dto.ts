import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class StudyInstanceUidParamDto {
  @IsString()
  @IsNotEmpty()
  studyInstanceUid!: string;
}

export class ViewerStateUserStudyParamDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  studyInstanceUid!: string;
}

export class ViewerStateIdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
