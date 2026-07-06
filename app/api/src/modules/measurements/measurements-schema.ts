import { MeasurementEntity } from './entities/measurement.entity';
import { MeasurementDto } from './dto/save-measurements.dto';
import type { SaveMeasurementsDto, SeriesMeasurementsDto, StudyMeasurementsDto } from './dto/save-measurements.dto';
import type {
  MeasurementRecord,
  SeriesMeasurements,
  StudiesMeasurementsBody,
  StudyMeasurements,
} from '@shared/schemas/measurements.schema';

export type {
  MeasurementRecord,
  MeasurementCoordinates,
  SeriesMeasurements,
  StudyMeasurements,
  StudiesMeasurementsBody,
  SaveMeasurementsBody,
  MeasurementsListResponse,
} from '@shared/schemas/measurements.schema';

export type StudyMeasurementsSchema = StudyMeasurements;
export type StudiesMeasurementsSchema = StudiesMeasurementsBody;

const UNKNOWN_SERIES = 'unknown-series';

const PRESET_TO_TYPE: Record<string, string> = {
  'pa-length': 'PA_LENGTH',
  'canal-angle': 'CANAL_ANGLE',
  'crown-width': 'CROWN_WIDTH',
  'root-length': 'ROOT_LENGTH',
};

export function resolveMeasurementType(
  dentalPresetId?: string | null,
  explicitType?: string | null,
): string | null {
  if (explicitType?.trim()) {
    return explicitType.trim();
  }
  if (!dentalPresetId) {
    return null;
  }
  return PRESET_TO_TYPE[dentalPresetId] ?? dentalPresetId.toUpperCase().replace(/-/g, '_');
}

export function normalizeApiCoordinates(
  coordinates?: Record<string, unknown>,
  seriesId?: string,
): Record<string, unknown> | undefined {
  const source = { ...(coordinates ?? {}) };
  const resolvedSeriesId = String(
    seriesId ??
      source.series_id ??
      source.series_instance_uid ??
      source.reference_series_uid ??
      '',
  );

  const normalized: Record<string, unknown> = {};

  if (source.points !== undefined) {
    normalized.points = source.points;
  }

  const frameOfReference = source.frame_of_reference_uid;
  if (frameOfReference) {
    normalized.frame_of_reference_uid = frameOfReference;
  }

  const sopInstance = source.sop_instance_uid;
  if (sopInstance) {
    normalized.sop_instance_uid = sopInstance;
  }

  const referencedImage = source.referenced_image_id;
  if (referencedImage) {
    normalized.referenced_image_id = referencedImage;
  }

  const displaySet = source.display_set_instance_uid;
  if (displaySet) {
    normalized.display_set_instance_uid = displaySet;
  }

  if (source.is_locked) {
    normalized.is_locked = source.is_locked;
  }

  if (source.is_visible !== undefined) {
    normalized.is_visible = source.is_visible;
  }

  if (source.dental_preset_id) {
    normalized.dental_preset_id = source.dental_preset_id;
  }

  if (resolvedSeriesId && resolvedSeriesId !== UNKNOWN_SERIES) {
    normalized.series_id = resolvedSeriesId;
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function resolveSeriesId(measurement: {
  series_id?: string;
  coordinates?: Record<string, unknown>;
}): string {
  const coordinates = measurement.coordinates ?? {};
  return String(
    measurement.series_id ??
      coordinates.series_id ??
      coordinates.series_instance_uid ??
      coordinates.reference_series_uid ??
      UNKNOWN_SERIES,
  );
}

export function entityToMeasurementRecord(entity: MeasurementEntity): MeasurementRecord {
  const seriesId = entity.series_id ?? resolveSeriesId({ coordinates: entity.coordinates });

  return {
    id: entity.id,
    viewer_state_id: entity.viewer_state_id ?? undefined,
    label: entity.label,
    value: entity.value,
    unit: entity.unit,
    tool: entity.tool,
    type: entity.type ?? undefined,
    viewport: entity.viewport ?? undefined,
    image_id: entity.image_id ?? undefined,
    captured_at: entity.captured_at,
    series_id: seriesId,
    dental_preset_id: entity.dental_preset_id ?? (entity.coordinates?.dental_preset_id as string | undefined),
    coordinates: normalizeApiCoordinates(entity.coordinates, seriesId) as MeasurementRecord['coordinates'],
  };
}

export function groupMeasurementsToStudies(
  entities: MeasurementEntity[],
): StudiesMeasurementsSchema {
  const studyMap = new Map<string, Map<string, MeasurementRecord[]>>();

  entities.forEach(entity => {
    const studyUid = entity.study_instance_uid;
    const seriesId = entity.series_id ?? resolveSeriesId({ coordinates: entity.coordinates });
    const record = entityToMeasurementRecord(entity);

    if (!studyMap.has(studyUid)) {
      studyMap.set(studyUid, new Map());
    }

    const seriesMap = studyMap.get(studyUid)!;
    if (!seriesMap.has(seriesId)) {
      seriesMap.set(seriesId, []);
    }

    seriesMap.get(seriesId)!.push(record);
  });

  return {
    studies: Array.from(studyMap.entries()).map(([study_instance_uid, seriesMap]) => ({
      study_instance_uid,
      series: Array.from(seriesMap.entries()).map(([series_id, measurements]) => ({
        series_id,
        measurements,
      })),
    })),
  };
}

export function flattenStudiesToSavePayload(
  studies: StudyMeasurementsDto[],
): Array<{ study_instance_uid: string; measurements: MeasurementDto[] }> {
  return studies.map(study => {
    const measurements: MeasurementDto[] = [];

    study.series?.forEach(series => {
      const seriesId = series.series_id;
      series.measurements?.forEach(measurement => {
        measurements.push({
          ...measurement,
          series_id: measurement.series_id ?? seriesId,
          coordinates: normalizeApiCoordinates(measurement.coordinates, seriesId),
        });
      });
    });

    return {
      study_instance_uid: study.study_instance_uid,
      measurements,
    };
  });
}

export function normalizeSaveMeasurementsInput(
  dto: SaveMeasurementsDto,
): Array<{ study_instance_uid: string; measurements: MeasurementDto[] }> {
  if (dto.studies?.length) {
    return flattenStudiesToSavePayload(dto.studies);
  }

  const studyInstanceUid = dto.study_instance_uid ?? '';
  const measurements = dto.measurements ?? [];

  if (!studyInstanceUid) {
    return [];
  }

  return [
    {
      study_instance_uid: studyInstanceUid,
      measurements: measurements.map(measurement => {
        const seriesId = resolveSeriesId(measurement);
        return {
          ...measurement,
          series_id: seriesId,
          coordinates: normalizeApiCoordinates(measurement.coordinates, seriesId),
        };
      }),
    },
  ];
}

export function buildStudiesFromSeriesList(
  studyInstanceUid: string,
  series: SeriesMeasurementsDto[],
): StudyMeasurementsSchema {
  return {
    study_instance_uid: studyInstanceUid,
    series: series.map(item => ({
      series_id: item.series_id,
      measurements: item.measurements ?? [],
    })),
  };
}

export { resolveSeriesId };
