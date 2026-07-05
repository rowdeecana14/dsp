import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/users/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { UserEntity } from '../../src/modules/users/entities/user.entity';
import { RoleEntity } from '../../src/modules/roles/entities/role.entity';
import { PermissionEntity } from '../../src/modules/permissions/entities/permission.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let auditService: AuditService;
  let userRepository: Repository<UserEntity>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    roles: [],
    permissions: [],
  } as UserEntity;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserService = {
    authenticate: jest.fn(),
    addUser: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockAuditService = {
    logLogin: jest.fn(),
    logLogout: jest.fn(),
    logCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    auditService = module.get<AuditService>(AuditService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      mockUserService.authenticate.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual({
        token: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
      expect(mockUserService.authenticate).toHaveBeenCalledWith('test@example.com', 'password');
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(mockAuditService.logLogin).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      mockUserService.authenticate.mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockUserService.addUser.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
        roles: ['user'],
        permissions: [],
      });

      expect(result).toEqual({
        token: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      });
      expect(mockUserService.addUser).toHaveBeenCalled();
      expect(mockAuditService.logCreate).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUserService.addUser.mockRejectedValue(new ConflictException('User already exists'));

      await expect(service.register({
        email: 'test@example.com',
        name: 'Test User',
        password: 'Password123!',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('myProfile', () => {
    it('should return user profile', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      const result = await service.myProfile('1');

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
      }));
      expect(mockUserService.getUserById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('1', { name: 'Updated Name' });

      expect(result).toEqual(expect.objectContaining({
        name: 'Updated Name',
      }));
      expect(mockUserService.updateUser).toHaveBeenCalledWith('1', { name: 'Updated Name' });
    });
  });
});
