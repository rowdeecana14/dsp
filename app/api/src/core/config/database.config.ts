import { ConfigService } from '@nestjs/config';
import { buildTypeOrmModuleOptions } from '../database/typeorm.factory';

export const getDatabaseConfig = (configService: ConfigService) =>
  buildTypeOrmModuleOptions(configService);
