import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiSecurity } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { IdParamDto } from './dto/id-param.dto';
import { UserService } from './services/user.service';
import { Permission } from '../../modules/auth/decorators/permission.decorator';
import { UsersPaginationDto } from './dto/users-pagination.dto';
import { UsersPaginationService } from './services/users.pagination.service';
import { JwtAuth } from '../../modules/auth/decorators/jwt-auth.decorator';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@ApiSecurity('API-key')
@JwtAuth()
@Roles('Admin')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UserService,
    private readonly usersPaginationService: UsersPaginationService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.addUser(
      createUserDto.email,
      createUserDto.name,
      createUserDto.password,
      createUserDto.roles,
      createUserDto.permissions,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: this.usersService.sanitizeUser(user) as unknown as GetUserDto,
    };
  }

  @Get()
  @Permission('users.read')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: UsersPaginationDto) {
    return this.usersPaginationService.list(query);
  }

  @Get(':id')
  @Permission('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param() params: IdParamDto) {
    const user = await this.usersService.getUserById(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully',
      data: this.usersService.sanitizeUser(user) as unknown as GetUserDto,
    };
  }

  @Patch(':id')
  @Permission('users.update')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param() params: IdParamDto, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.updateUser(params.id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: this.usersService.sanitizeUser(user) as unknown as GetUserDto,
    };
  }

  @Delete(':id')
  @Permission('users.delete')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async remove(@Param() params: IdParamDto) {
    const user = await this.usersService.remove(params.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User deleted successfully',
      data: this.usersService.sanitizeUser(user) as unknown as DeleteUserDto,
    };
  }
}
