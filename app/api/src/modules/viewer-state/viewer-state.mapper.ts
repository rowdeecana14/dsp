import { SaveViewerStateDto } from './dto/save-viewer-state.dto';

export function resolveViewerStateFields(dto: SaveViewerStateDto) {
  return {
    study_instance_uid: dto.study_instance_uid,
    mode: dto.mode,
    theme: dto.theme,
    selected_tooth: dto.selected_tooth,
    tooth_system: dto.tooth_system,
    viewport_layout: dto.viewport_layout,
    patient_id: dto.patient_id,
    viewport_config: dto.viewport_config,
  };
}
