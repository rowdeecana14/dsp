import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../users/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const userId = payload.sub ?? payload.id;
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles?.map((role) => role.name) ?? [],
      permissions: user.permissions?.map((permission) => permission.name) ?? [],
    };
  }
}
