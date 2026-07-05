import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewerStateService } from './viewer-state.service';
import { ViewerStateController } from './viewer-state.controller';
import { ViewerStateEntity } from './entities/viewer-state.entity';
import { ViewerStateRepository } from './viewer-state.repository';
import { ViewerStatePaginationService } from './services/viewer-state.pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([ViewerStateEntity])],
  controllers: [ViewerStateController],
  providers: [ViewerStateService, ViewerStateRepository, ViewerStatePaginationService],
  exports: [ViewerStateService],
})
export class ViewerStateModule {}
