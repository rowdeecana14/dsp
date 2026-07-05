import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '../auth/decorators/permission.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuth } from '../auth/decorators/jwt-auth.decorator';
import { IdParamDto } from './dto/id-param.dto';
import { PermissionsPaginationService } from './services/permissions.pagination.service';
import { PermissionsPaginationDto } from './dto/permissions-pagination.dto';

@ApiTags('permissions')
@ApiBearerAuth()
@ApiSecurity('API-key')
@Controller({ path: 'permissions', version: '1' })
@JwtAuth()
@Roles('Admin')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly permissionsPaginationService: PermissionsPaginationService,
  ) {}

  @Get()
  @Permission('permissions.read')
  @ApiOperation({ summary: 'Get all permissions with pagination' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: PermissionsPaginationDto) {
    return this.permissionsPaginationService.list(query);
  }

  @Post()
  @Permission('permissions.create')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: CreatePermissionDto })
  async create(@Body() dto: CreatePermissionDto) {
    const permission = await this.permissionsService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Permission created successfully',
      data: permission,
    };
  }

  @Get(':id')
  @Permission('permissions.read')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  async findOne(@Param() params: IdParamDto) {
    const permission = await this.permissionsService.findOne(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission fetched successfully',
      data: permission,
    };
  }

  @Put(':id')
  @Permission('permissions.update')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiBody({ type: UpdatePermissionDto })
  async update(@Param() params: IdParamDto, @Body() dto: UpdatePermissionDto) {
    const permission = await this.permissionsService.update(params.id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  @Patch(':id')
  @Permission('permissions.update')
  @ApiOperation({ summary: 'Partially update permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiBody({ type: UpdatePermissionDto })
  async patch(@Param() params: IdParamDto, @Body() dto: UpdatePermissionDto) {
    const permission = await this.permissionsService.update(params.id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission updated successfully',
      data: permission,
    };
  }

  @Delete(':id')
  @Permission('permissions.delete')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  async remove(@Param() params: IdParamDto) {
    const permission = await this.permissionsService.remove(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission deleted successfully',
      data: permission,
    };
  }
}
