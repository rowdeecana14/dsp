import { registerAs } from '@nestjs/config';
import { loggingSchema } from './schema/logging.schema';

export const loggingNamespaceConfig = registerAs('logging', () => {
  const env = loggingSchema.parse(process.env);
  return {
    level: env.LOG_LEVEL,
    enableFileLog: env.ENABLE_FILE_LOG,
    enableConsoleLog: env.ENABLE_CONSOLE_LOG,
  };
});
