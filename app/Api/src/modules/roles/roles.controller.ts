import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../../modules/auth/decorators/permission.decorator';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { JwtAuth } from '../../modules/auth/decorators/jwt-auth.decorator';
import { IdParamDto } from './dto/id-param.dto';
import { RolesPaginationService } from './services/roles.pagination.service';
import { RolesPaginationDto } from './dto/roles-pagination.dto';

@ApiTags('roles')
@ApiBearerAuth()
@ApiSecurity('API-key')
@Controller({ path: 'roles', version: '1' })
@JwtAuth()
@Roles('Admin')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly rolesPaginationService: RolesPaginationService,
  ) {}

  @Get()
  @Permission('roles.read')
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: RolesPaginationDto) {
    return this.rolesPaginationService.list(query);
  }

  @Post()
  @Permission('roles.create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.rolesService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Role created successfully',
      data: role,
    };
  }

  @Get(':id')
  @Permission('roles.read')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  async findOne(@Param() params: IdParamDto) {
    const role = await this.rolesService.findOne(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role fetched successfully',
      data: role,
    };
  }

  @Put(':id')
  @Permission('roles.update')
  @ApiOperation({ summary: 'Update role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  async update(@Param() params: IdParamDto, @Body() dto: UpdateRoleDto) {
    const role = await this.rolesService.update(params.id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role updated successfully',
      data: role,
    };
  }

  @Patch(':id')
  @Permission('roles.update')
  @ApiOperation({ summary: 'Partially update role by ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  async patch(@Param() params: IdParamDto, @Body() dto: UpdateRoleDto) {
    const role = await this.rolesService.update(params.id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role updated successfully',
      data: role,
    };
  }

  @Delete(':id')
  @Permission('roles.delete')
  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  async remove(@Param() params: IdParamDto) {
    const role = await this.rolesService.remove(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Role deleted successfully',
      data: role,
    };
  }
}
