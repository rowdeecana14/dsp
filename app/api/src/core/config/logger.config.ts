import { Params } from 'nestjs-pino';
import { IncomingMessage } from 'http';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { CORRELATION_ID_HEADER } from '../logging/correlation.constants';

type PinoHttpOptions = NonNullable<Params['pinoHttp']>;

export const getLoggerConfig = (configService: ConfigService): PinoHttpOptions => {
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');
  const logLevel = configService.get<string>('logging.level', 'info');
  const enableFileLogging = configService.get<boolean>('logging.enableFileLog', false);
  const enableConsoleLogging = configService.get<boolean>('logging.enableConsoleLog', true);

  const baseConfig: PinoHttpOptions = {
    level: logLevel,
    genReqId: (req: IncomingMessage) => {
      const headers = req.headers;
      const correlationId =
        headers[CORRELATION_ID_HEADER] || headers['x-request-id'] || crypto.randomUUID();
      return Array.isArray(correlationId) ? correlationId[0] : String(correlationId);
    },
    customProps: (req: IncomingMessage) => ({
      correlationId: (req as IncomingMessage & { id?: string }).id ?? req.headers[CORRELATION_ID_HEADER],
    }),
  };

  if (nodeEnv === 'test') {
    return { ...baseConfig, level: 'error' };
  }

  if (nodeEnv === 'production') {
    return baseConfig;
  }

  const targets: { target: string; options: Record<string, unknown> }[] = [];
  const commonPrettyOptions = {
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
    ignore: 'pid,hostname,reqId,responseTime',
    singleLine: true,
  };
  const colorMapping = 'error:red,warn:yellow,info:blue,debug:gray';

  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  const today = new Date().toISOString().split('T')[0];
  const logFilePath = path.join(logsDir, `app-${today}.log`);

  if (enableConsoleLogging) {
    targets.push({
      target: 'pino-pretty',
      options: { ...commonPrettyOptions, colorize: true, customColors: colorMapping },
    });
  }

  if (enableFileLogging) {
    targets.push({
      target: 'pino-pretty',
      options: {
        ...commonPrettyOptions,
        colorize: false,
        destination: logFilePath,
        mkdir: true,
        append: true,
      },
    });
  }

  return {
    ...baseConfig,
    transport: targets.length > 0 ? { targets } : undefined,
  };
};
