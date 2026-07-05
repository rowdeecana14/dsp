import { BadRequestException, Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { ViewerStateService } from './viewer-state.service';
import { SaveViewerStateDto } from './dto/save-viewer-state.dto';
import { AuthUserDto } from '../auth/dto/auth.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { ViewerStatePaginationDto } from './dto/viewer-state-pagination.dto';
import { ViewerStatePaginationService } from './services/viewer-state.pagination.service';

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

  @Post()
  @ApiOperation({ summary: 'Save viewer state' })
  @ApiResponse({ status: 200, description: 'Viewer state saved successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: SaveViewerStateDto })
  async saveState(@Body() saveViewerStateDto: SaveViewerStateDto, @Auth() auth: AuthUserDto) {
    const saved = await this.viewerStateService.saveState({
      study_instance_uid: saveViewerStateDto.study_instance_uid,
      mode: saveViewerStateDto.mode,
      theme: saveViewerStateDto.theme,
      selected_tooth: saveViewerStateDto.selected_tooth,
      tooth_system: saveViewerStateDto.tooth_system,
      viewport_layout: saveViewerStateDto.viewport_layout,
      measurements: saveViewerStateDto.measurements,
      user_id: auth.id,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Viewer state saved successfully',
      data: saved,
    };
  }
}
