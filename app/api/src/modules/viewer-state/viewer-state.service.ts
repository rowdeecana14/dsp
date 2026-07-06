import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ViewerStateRepository } from './viewer-state.repository';
import { ViewerStateEntity } from './entities/viewer-state.entity';
import { UpdateViewerStateDto } from './dto/update-viewer-state.dto';

@Injectable()
export class ViewerStateService {
  constructor(private readonly viewerStateRepository: ViewerStateRepository) {}

  async getState(study_instance_uid: string, userId: string) {
    const state = await this.viewerStateRepository.findByStudyAndUser(study_instance_uid, userId);
    if (!state) {
      throw new NotFoundException('State not found');
    }
    return state;
  }

  async getStateById(id: string, userId: string) {
    const state = await this.viewerStateRepository.findByIdAndUser(id, userId);
    if (!state) {
      throw new NotFoundException('State not found');
    }
    return state;
  }

  async saveState(payload: Partial<ViewerStateEntity> & { study_instance_uid: string; user_id: string }) {
    const existingState = await this.viewerStateRepository.findByStudyAndUser(payload.study_instance_uid, payload.user_id);
    const stateEntity = existingState ?? new ViewerStateEntity();

    stateEntity.user_id = payload.user_id;
    stateEntity.study_instance_uid = payload.study_instance_uid;
    stateEntity.mode = payload.mode ?? stateEntity.mode ?? 'dental';
    stateEntity.theme = payload.theme ?? stateEntity.theme ?? 'dental';
    stateEntity.selected_tooth = payload.selected_tooth ?? stateEntity.selected_tooth ?? '11';
    stateEntity.tooth_system = payload.tooth_system ?? stateEntity.tooth_system ?? 'FDI';
    stateEntity.viewport_layout = payload.viewport_layout ?? stateEntity.viewport_layout ?? '2x2-dental';

    if (payload.patient_id !== undefined) {
      stateEntity.patient_id = payload.patient_id;
    }
    if (payload.viewport_config !== undefined) {
      stateEntity.viewport_config = payload.viewport_config;
    }

    return this.viewerStateRepository.saveState(stateEntity);
  }

  async updateState(id: string, userId: string, dto: UpdateViewerStateDto) {
    const state = await this.getStateById(id, userId);

    if (dto.mode !== undefined) {
      state.mode = dto.mode;
    }
    if (dto.theme !== undefined) {
      state.theme = dto.theme;
    }
    if (dto.selected_tooth !== undefined) {
      state.selected_tooth = dto.selected_tooth;
    }
    if (dto.tooth_system !== undefined) {
      state.tooth_system = dto.tooth_system;
    }
    if (dto.viewport_layout !== undefined) {
      state.viewport_layout = dto.viewport_layout;
    }
    if (dto.patient_id !== undefined) {
      state.patient_id = dto.patient_id ?? null;
    }
    if (dto.viewport_config !== undefined) {
      state.viewport_config = dto.viewport_config ?? null;
    }

    return this.viewerStateRepository.saveState(state);
  }

  assertUserAccess(requestedUserId: string, authUserId: string) {
    if (requestedUserId !== authUserId) {
      throw new ForbiddenException('Cannot access another user viewer state');
    }
  }
}
