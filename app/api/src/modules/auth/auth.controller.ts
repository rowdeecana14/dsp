import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from './decorators/auth.decorator';
import { JwtAuth } from './decorators/jwt-auth.decorator';
import { Roles } from './decorators/roles.decorator';
import { Permission } from './decorators/permission.decorator';
import { AuthUserDto } from './dto/auth.dto';
import { ApiKeyPublic } from '../../core/decorators/api-key.decorator';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiKeyPublic()
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(loginDto);
    req.auth = {
      user: result.user,
      roles: result.user.roles ?? [],
      permissions: result.user.permissions ?? [],
      token: result.token,
    };
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged in successfully',
      data: result,
    };
  }

  @Post('register')
  @ApiKeyPublic()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      data: user,
    };
  }

  @Get('me')
  @JwtAuth()
  @ApiBearerAuth()
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async myProfile(@Auth() auth: AuthUserDto,) {
    const profile = await this.authService.myProfile(auth.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile fetched successfully',
      data: profile,
    };
  }

  @Patch('me')
  @JwtAuth()
  @ApiBearerAuth()
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(@Auth() auth: AuthUserDto, @Body() updateUserDto: UpdateUserDto) {
    const profile = await this.authService.updateProfile(auth.id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully',
      data: profile,
    };
  }

  @Get('admin-only')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Admin-only endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async adminOnly() {
    return {
      statusCode: HttpStatus.OK,
      message: 'This route is restricted to admin users',
      data: null,
    };
  }

  @Get('permission-only')
  @Permission('manage-users')
  @ApiBearerAuth()
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Permission-only endpoint' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async permissionOnly() {
    return {
      statusCode: HttpStatus.OK,
      message: 'This route is restricted to users with manage-users permission',
      data: null,
    };
  }

  @Get('settings')
  @JwtAuth()
  @ApiBearerAuth()
  @ApiSecurity('API-key')
  @ApiOperation({ summary: 'Get user settings' })
  @ApiResponse({ status: 200, description: 'Settings fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async manageSettings(@Auth() auth: AuthUserDto) {
    const settings = await this.authService.getUserSettings(auth.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User settings fetched successfully',
      data: settings,
    };
  }

  @Post('logout')
  @ApiKeyPublic()
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Logged out successfully',
      data: null,
    };
  }
}
