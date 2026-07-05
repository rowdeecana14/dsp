import { DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

/**
 * Get Swagger/OpenAPI configuration
 * @param configService NestJS ConfigService
 * @returns OpenAPI document configuration
 */
export const getSwaggerConfig = (configService: ConfigService) => {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const apiVersion = '1.0';
  const title = 'Dental Viewer API';
  const description = 'Backend API for Dental Viewer Application';

  const builder = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(apiVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        description: 'Enter API key for authentication',
        in: 'header',
      },
      'API-key',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('roles', 'Role management')
    .addTag('permissions', 'Permission management')
    .addTag('measurements', 'Measurement endpoints')
    .addTag('viewer-state', 'Viewer state management')
    .addTag('audit', 'Audit logs');

  // Add contact information
  builder.setContact(
    'API Support',
    'https://example.com/support',
    'support@example.com',
  );

  // Add license information
  builder.setLicense('MIT', 'https://opensource.org/licenses/MIT');

  // Add server URLs based on environment
  if (nodeEnv === 'production') {
    builder.addServer('https://api.example.com', 'Production server');
  } else if (nodeEnv === 'development') {
    builder.addServer('http://localhost:3000', 'Development server');
  } else {
    builder.addServer('http://localhost:3000', 'Test server');
  }

  return builder.build();
};