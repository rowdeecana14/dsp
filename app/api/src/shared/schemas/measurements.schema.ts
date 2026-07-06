/**
 * Canonical measurements API schema — keep in sync between API and dental viewer.
 *
 * Wire format:
 *   studies[] → study_instance_uid → series[] → series_id → measurements[]
 */

export interface MeasurementCoordinates {
  points?: unknown[];
  frame_of_reference_uid?: string;
  sop_instance_uid?: string;
  referenced_image_id?: string;
  display_set_instance_uid?: string;
  is_locked?: boolean;
  is_visible?: boolean;
  series_id?: string;
  series_instance_uid?: string;
  reference_series_uid?: string;
  dental_preset_id?: string;
  selected_tooth?: string;
}

export interface MeasurementRecord {
  id?: string;
  viewer_state_id?: string;
  label: string;
  value: string;
  unit: string;
  tool: string;
  type?: string;
  viewport?: string;
  image_id?: string;
  captured_at: string;
  dental_preset_id?: string;
  series_id?: string;
  coordinates?: MeasurementCoordinates;
}

export interface SeriesMeasurements {
  series_id: string;
  measurements: MeasurementRecord[];
}

export interface StudyMeasurements {
  study_instance_uid: string;
  series: SeriesMeasurements[];
}

export interface StudiesMeasurementsBody {
  studies: StudyMeasurements[];
}

export interface ApiPaginationMeta {
  total: number;
  page: number;
  limit: number;
  last_page: number;
  sort_by: string;
  sort_order: string;
}

export interface MeasurementsListResponse {
  data: StudiesMeasurementsBody;
  meta?: ApiPaginationMeta;
}

export interface SaveMeasurementsBody extends StudiesMeasurementsBody {}

/** Legacy flat POST body (still supported). */
export interface SaveMeasurementsFlatBody {
  study_instance_uid: string;
  measurements: MeasurementRecord[];
}

export type SaveMeasurementsRequest = SaveMeasurementsBody | SaveMeasurementsFlatBody;

export const UPDATE_MEASUREMENT_ACTIONS = ['rename', 'lock', 'visible', 'hide'] as const;
export type UpdateMeasurementAction = (typeof UPDATE_MEASUREMENT_ACTIONS)[number];

export interface UpdateMeasurementRequest {
  action: UpdateMeasurementAction;
  label?: string;
  is_locked?: boolean;
}

/** Full measurement update (coordinates, value, metadata). */
export interface PutMeasurementRequest {
  label?: string;
  value?: string;
  unit?: string;
  tool?: string;
  type?: string;
  viewport?: string;
  image_id?: string;
  dental_preset_id?: string;
  coordinates?: MeasurementCoordinates;
}

export interface CreateMeasurementRequest {
  study_instance_uid: string;
  viewer_state_id?: string;
  label: string;
  value: string;
  unit: string;
  tool: string;
  type?: string;
  viewport?: string;
  image_id?: string;
  dental_preset_id?: string;
  series_id?: string;
  captured_at?: string;
  coordinates?: MeasurementCoordinates;
}

export interface UpdateMeasurementResponse {
  id: string;
  measurement: MeasurementRecord;
}

export interface DeleteMeasurementResponse {
  id: string;
}
