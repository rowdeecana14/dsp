/** Wire-format types matching NestJS API — sourced from shared schema. */

import type { ToothSystem } from '../../../shared/utils/toothNumbering';
import type { DentalFetchOptions } from '../../../shared/services/api';
import type { ViewportConfig } from '../../../shared/types/viewport';

export type {
  MeasurementCoordinates,
  MeasurementRecord,
  SeriesMeasurements,
  StudyMeasurements,
  StudiesMeasurementsBody,
  SaveMeasurementsBody,
  SaveMeasurementsFlatBody,
  SaveMeasurementsRequest,
  MeasurementsListResponse,
  ApiPaginationMeta,
  UpdateMeasurementAction,
  UpdateMeasurementRequest,
  UpdateMeasurementResponse,
  DeleteMeasurementResponse,
  CreateMeasurementRequest,
  PutMeasurementRequest,
} from '../../../../../../../api/src/shared/schemas/measurements.schema';

import type {
  MeasurementRecord,
  SeriesMeasurements,
  StudyMeasurements,
  StudiesMeasurementsBody,
  ApiPaginationMeta,
  UpdateMeasurementRequest,
  MeasurementCoordinates,
} from '../../../../../../../api/src/shared/schemas/measurements.schema';

/** Dental measurement export — snake_case API wire format. */
export interface DentalMeasurementExport {
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
  coordinates?: MeasurementCoordinates;
}

export type ViewportConfig = import('../../../shared/types/viewport').ViewportConfig;

export interface ViewerStatePayload {
  study_instance_uid: string;
  mode?: string;
  theme?: string;
  selected_tooth?: string;
  tooth_system?: ToothSystem;
  viewport_layout?: string;
  patient_id?: string;
  viewport_config?: ViewportConfig;
}

export interface ViewerStateRecord extends ViewerStatePayload {
  id?: string;
  created_at?: string;
  updated_at?: string;
}

export type ApiMeasurementRecord = MeasurementRecord;
export type ApiSeriesMeasurements = SeriesMeasurements;
export type ApiStudyMeasurements = StudyMeasurements;
export type ApiStudiesMeasurementsSchema = StudiesMeasurementsBody;
export type ApiSaveMeasurementsBody = StudiesMeasurementsBody;

export type ApiViewerStateRecord = ViewerStateRecord;
export type ApiSaveViewerStateBody = ViewerStatePayload;

export type ApiPaginatedResponse<T> = {
  data: T;
  meta?: ApiPaginationMeta;
};

export type MeasurementsListQuery = {
  study_instance_uid: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  search?: string;
  dental_preset_id?: string;
  fetchOptions?: DentalFetchOptions;
};

export type MeasurementsPageResult = {
  measurements: DentalMeasurementExport[];
  meta: ApiPaginationMeta;
};

export type { ToothSystem, UpdateMeasurementRequest };
