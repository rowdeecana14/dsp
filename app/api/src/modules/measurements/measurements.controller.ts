import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { SaveMeasurementsDto } from './dto/save-measurements.dto';
import { AuthUserDto } from '../auth/dto/auth.dto';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { Auth } from '../auth/decorators/auth.decorator';
import { IdParamDto } from './dto/id-param.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';
import { BulkUpdateMeasurementsDto } from './dto/bulk-update-measurements.dto';
import { MeasurementsPaginationDto } from './dto/measurements-pagination.dto';
import { MeasurementsPaginationService } from './services/measurements.pagination.service';
import { groupMeasurementsToStudies } from './measurements-schema';
import { CreateMeasurementDto, PutMeasurementDto, ViewerStateIdParamDto } from './dto/create-measurement.dto';

@ApiTags('measurements')
@ApiBearerAuth()
@ApiSecurity('API-key')
@JwtAuth()
@Controller({ path: 'measurements', version: '1' })
export class MeasurementsController {
  constructor(
    private readonly measurementsService: MeasurementsService,
    private readonly measurementsPaginationService: MeasurementsPaginationService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get measurements with pagination' })
  @ApiResponse({ status: 200, description: 'Measurements retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMeasurements(
    @Query() query: MeasurementsPaginationDto,
    @Auth() auth: AuthUserDto,
  ) {
    const result = await this.measurementsPaginationService.list(query, auth.id);
    return {
      ...result,
      data: groupMeasurementsToStudies(result.data),
    };
  }

  @Get('viewer-state/:viewer_state_id')
  @ApiOperation({ summary: 'Get all measurements for a viewer state' })
  @ApiParam({ name: 'viewer_state_id', description: 'Viewer state ID' })
  async getMeasurementsByViewerState(
    @Param() params: ViewerStateIdParamDto,
    @Auth() auth: AuthUserDto,
  ) {
    const measurements = await this.measurementsService.getMeasurementsByViewerState(
      params.viewer_state_id,
      auth.id,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurements retrieved successfully',
      data: groupMeasurementsToStudies(measurements),
    };
  }

  @Post()
  @ApiOperation({ summary: 'Save measurements (bulk replace per study)' })
  @ApiResponse({ status: 200, description: 'Measurements saved successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: SaveMeasurementsDto })
  async saveMeasurements(@Body() saveMeasurementsDto: SaveMeasurementsDto, @Auth() auth: AuthUserDto) {
    const saved = await this.measurementsService.saveMeasurementsPayload(
      saveMeasurementsDto,
      auth.id,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurements saved successfully',
      data: groupMeasurementsToStudies(saved),
    };
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a single measurement' })
  @ApiBody({ type: CreateMeasurementDto })
  async createMeasurement(
    @Body() createMeasurementDto: CreateMeasurementDto,
    @Auth() auth: AuthUserDto,
  ) {
    const measurement = await this.measurementsService.createMeasurement(
      createMeasurementDto,
      auth.id,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Measurement created successfully',
      data: measurement,
    };
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update measurements (rename, lock, visible, hide)' })
  @ApiResponse({ status: 200, description: 'Measurements updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: BulkUpdateMeasurementsDto })
  async bulkUpdateMeasurements(
    @Body() bulkUpdateDto: BulkUpdateMeasurementsDto,
    @Auth() auth: AuthUserDto,
  ) {
    const { ids, ...update } = bulkUpdateDto;
    const result = await this.measurementsService.bulkUpdateMeasurements(
      ids,
      auth.id,
      update,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurements updated successfully',
      data: result,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update measurement metadata (rename, lock, visible, hide)' })
  @ApiResponse({ status: 200, description: 'Measurement updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Measurement not found' })
  @ApiParam({ name: 'id', description: 'Measurement ID' })
  @ApiBody({ type: UpdateMeasurementDto })
  async updateMeasurement(
    @Param() params: IdParamDto,
    @Body() updateMeasurementDto: UpdateMeasurementDto,
    @Auth() auth: AuthUserDto,
  ) {
    const measurement = await this.measurementsService.updateMeasurement(
      params.id,
      auth.id,
      updateMeasurementDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurement updated successfully',
      data: {
        id: params.id,
        measurement,
      },
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update measurement (full payload: value, coordinates, etc.)' })
  @ApiParam({ name: 'id', description: 'Measurement ID' })
  @ApiBody({ type: PutMeasurementDto })
  async putMeasurement(
    @Param() params: IdParamDto,
    @Body() putMeasurementDto: PutMeasurementDto,
    @Auth() auth: AuthUserDto,
  ) {
    const measurement = await this.measurementsService.putMeasurement(
      params.id,
      auth.id,
      putMeasurementDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurement updated successfully',
      data: measurement,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete measurement by ID' })
  @ApiResponse({ status: 200, description: 'Measurement deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Measurement not found' })
  @ApiParam({ name: 'id', description: 'Measurement ID' })
  async deleteMeasurement(@Param() params: IdParamDto, @Auth() auth: AuthUserDto) {
    const deleted = await this.measurementsService.deleteMeasurement(params.id, auth.id);
    if (!deleted) {
      throw new NotFoundException('Measurement not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurement deleted successfully',
      data: { id: params.id },
    };
  }
}
