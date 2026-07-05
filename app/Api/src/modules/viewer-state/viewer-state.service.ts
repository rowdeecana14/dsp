import { Injectable, NotFoundException } from '@nestjs/common';
import { ViewerStateRepository } from './viewer-state.repository';
import { ViewerStateEntity } from './entities/viewer-state.entity';

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
    stateEntity.measurements = payload.measurements !== undefined ? payload.measurements : stateEntity.measurements ?? [];

    return this.viewerStateRepository.saveState(stateEntity);
  }
}
