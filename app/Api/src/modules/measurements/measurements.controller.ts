import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { SaveMeasurementsDto } from './dto/save-measurements.dto';
import { AuthUserDto } from '../auth/dto/auth.dto';
import { JwtAuth } from '../../modules/auth/decorators/jwt-auth.decorator';
import { Auth } from '../../modules/auth/decorators/auth.decorator';
import { IdParamDto } from './dto/id-param.dto';
import { MeasurementsPaginationDto } from './dto/measurements-pagination.dto';
import { MeasurementsPaginationService } from './services/measurements.pagination.service';

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
    return this.measurementsPaginationService.list(query, auth.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save measurements' })
  @ApiResponse({ status: 200, description: 'Measurements saved successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: SaveMeasurementsDto })
  async saveMeasurements(@Body() saveMeasurementsDto: SaveMeasurementsDto, @Auth() auth: AuthUserDto) {
    const saved = await this.measurementsService.saveMeasurements(
      saveMeasurementsDto.study_instance_uid,
      auth.id,
      saveMeasurementsDto.measurements,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Measurements saved successfully',
      data: saved,
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
