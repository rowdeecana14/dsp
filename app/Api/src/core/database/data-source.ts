import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { configuration, validationSchema } from '../config/configuration';
import { buildTypeOrmOptions } from './typeorm.factory';

config();

validationSchema.parse(process.env);

const configService = new ConfigService({
  ...configuration(),
  ...process.env,
});

export default new DataSource(buildTypeOrmOptions(configService));
