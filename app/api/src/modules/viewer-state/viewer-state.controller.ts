import { BadRequestException, Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { ViewerStateService } from './viewer-state.service';
import { SaveViewerStateDto } from './dto/save-viewer-state.dto';
import { UpdateViewerStateDto } from './dto/update-viewer-state.dto';
import { AuthUserDto } from '../auth/dto/auth.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { ViewerStatePaginationDto } from './dto/viewer-state-pagination.dto';
import { ViewerStatePaginationService } from './services/viewer-state.pagination.service';
import { resolveViewerStateFields } from './viewer-state.mapper';
import {
  StudyInstanceUidParamDto,
  ViewerStateIdParamDto,
  ViewerStateUserStudyParamDto,
} from './dto/viewer-state-params.dto';

@ApiTags('viewer-state')
@ApiBearerAuth()
@ApiSecurity('API-key')
@JwtAuth()
@Controller({ path: 'viewer-state', version: '1' })
export class ViewerStateController {
  constructor(
    private readonly viewerStateService: ViewerStateService,
    private readonly viewerStatePaginationService: ViewerStatePaginationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get viewer state with pagination' })
  @ApiResponse({ status: 200, description: 'Viewer state retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getState(
    @Query() query: ViewerStatePaginationDto,
    @Auth() auth: AuthUserDto,
  ) {
    return this.viewerStatePaginationService.list(query, auth.id);
  }

  @Get('study/:studyInstanceUid')
  @ApiOperation({ summary: 'Get viewer state for authenticated user and study' })
  @ApiParam({ name: 'studyInstanceUid', description: 'DICOM Study Instance UID' })
  async getStateForStudy(
    @Param() params: StudyInstanceUidParamDto,
    @Auth() auth: AuthUserDto,
  ) {
    try {
      const state = await this.viewerStateService.getState(params.studyInstanceUid, auth.id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Viewer state retrieved successfully',
        data: state,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Viewer state not found',
          data: null,
        };
      }
      throw error;
    }
  }

  @Get(':userId/:studyInstanceUid')
  @ApiOperation({ summary: 'Get viewer state by user and study (user must match authenticated user)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiParam({ name: 'studyInstanceUid', description: 'DICOM Study Instance UID' })
  async getStateByUserAndStudy(
    @Param() params: ViewerStateUserStudyParamDto,
    @Auth() auth: AuthUserDto,
  ) {
    this.viewerStateService.assertUserAccess(params.userId, auth.id);
    try {
      const state = await this.viewerStateService.getState(params.studyInstanceUid, auth.id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Viewer state retrieved successfully',
        data: state,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Viewer state not found',
          data: null,
        };
      }
      throw error;
    }
  }

  @Post()
  @ApiOperation({ summary: 'Save viewer state (create or upsert)' })
  @ApiResponse({ status: 200, description: 'Viewer state saved successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: SaveViewerStateDto })
  async saveState(@Body() saveViewerStateDto: SaveViewerStateDto, @Auth() auth: AuthUserDto) {
    const fields = resolveViewerStateFields(saveViewerStateDto);
    if (!fields.study_instance_uid) {
      throw new BadRequestException('study_instance_uid is required');
    }
    const saved = await this.viewerStateService.saveState({
      study_instance_uid: fields.study_instance_uid,
      mode: fields.mode,
      theme: fields.theme,
      selected_tooth: fields.selected_tooth,
      tooth_system: fields.tooth_system,
      viewport_layout: fields.viewport_layout,
      patient_id: fields.patient_id,
      viewport_config: fields.viewport_config,
      user_id: auth.id,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Viewer state saved successfully',
      data: saved,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update viewer state by ID' })
  @ApiParam({ name: 'id', description: 'Viewer state ID' })
  @ApiBody({ type: UpdateViewerStateDto })
  async updateState(
    @Param() params: ViewerStateIdParamDto,
    @Body() updateViewerStateDto: UpdateViewerStateDto,
    @Auth() auth: AuthUserDto,
  ) {
    const saved = await this.viewerStateService.updateState(params.id, auth.id, updateViewerStateDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Viewer state updated successfully',
      data: saved,
    };
  }
}
