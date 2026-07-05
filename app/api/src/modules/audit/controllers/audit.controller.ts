import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { AuditService } from '../services/audit.service';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { AuditLogResponseDto } from '../dto/audit-log-response.dto';
import { AuditEntityParamsDto, AuditIdParamDto } from '../dto/id-entity-param.dto';
import { UserIdParamDto } from '../dto/user-id-param.dto';
import { JwtAuth } from '../../auth/decorators/jwt-auth.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('audit')
@ApiBearerAuth()
@ApiSecurity('API-key')
@Controller({ path: 'audit', version: '1' })
@JwtAuth()
@Roles('Admin')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Search audit logs' })
  @ApiResponse({ status: 200, description: 'Audit records fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async search(@Query() query: AuditQueryDto) {
    const result = await this.auditService.search(query as any);
    return {
      statusCode: HttpStatus.OK,
      message: 'Audit records fetched successfully',
      data: {
        data: result.data.map((item) => new AuditLogResponseDto(item)),
        total: result.total,
        page: query.page,
        pageSize: query.page_size,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({ status: 200, description: 'Audit record fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Audit record not found' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  async findById(@Param() params: AuditIdParamDto) {
    const record = await this.auditService.findById(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Audit record fetched successfully',
      data: record ? new AuditLogResponseDto(record) : null,
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiResponse({ status: 200, description: 'Audit records fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUser(@Param() params: UserIdParamDto) {
    const records = (await this.auditService.findByUser(params.userId)).map((item) => new AuditLogResponseDto(item));
    return {
      statusCode: HttpStatus.OK,
      message: 'Audit records fetched successfully',
      data: records,
    };
  }

  @Get('entity/:entity/:id')
  @ApiOperation({ summary: 'Get audit logs by entity' })
  @ApiResponse({ status: 200, description: 'Audit records fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiParam({ name: 'entity', description: 'Entity name' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  async findByEntity(@Param() params: AuditEntityParamsDto) {
    const records = (await this.auditService.findByEntity(params.entity, params.id)).map((item) => new AuditLogResponseDto(item));
    return {
      statusCode: HttpStatus.OK,
      message: 'Audit records fetched successfully',
      data: records,
    };
  }
}
