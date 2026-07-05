import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionGuard } from './guards/permission.guard';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('JWT_EXPIRATION_TIME') || '24h';
        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: { expiresIn: expiresIn as `${number}h` },
        };
      },
    }),
    UsersModule,
    RolesModule,
    AuditModule,
  ],
  providers: [AuthService, JwtStrategy, AuthGuard, RolesGuard, PermissionGuard],
  controllers: [AuthController],
  exports: [
    AuthService,
    AuthGuard,
    RolesGuard,
    PermissionGuard,
    JwtModule,
    UsersModule,
    RolesModule,
  ],
})
export class AuthModule {}
