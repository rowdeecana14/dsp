import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { ViewerStateModule } from './modules/viewer-state/viewer-state.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    AuditModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ViewerStateModule,
    MeasurementsModule,
  ],
})
export class AppModule {}
