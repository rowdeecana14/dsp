import type { SelectQueryBuilder } from 'typeorm';
import type { MeasurementEntity } from '../entities/measurement.entity';
import type { MeasurementsPaginationDto } from '../dto/measurements-pagination.dto';

const UNKNOWN_SERIES = 'unknown-series';

/** Resolved series id for SQL — column first, then coordinates JSON fallbacks. */
export function measurementEffectiveSeriesIdSql(alias: string): string {
  return `COALESCE(
    NULLIF(${alias}.series_id, '${UNKNOWN_SERIES}'),
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(${alias}.coordinates, '$.series_id')), 'null'),
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(${alias}.coordinates, '$.series_instance_uid')), 'null'),
    NULLIF(JSON_UNQUOTE(JSON_EXTRACT(${alias}.coordinates, '$.reference_series_uid')), 'null')
  )`;
}

export function resolveMeasurementSeriesFilterIds(
  query: Pick<MeasurementsPaginationDto, 'series_ids' | 'series_id'>,
): string[] {
  const seriesIds = [
    ...(query.series_ids
      ?.split(',')
      .map(id => id.trim())
      .filter(Boolean) ?? []),
    ...(query.series_id?.trim() ? [query.series_id.trim()] : []),
  ];

  return [...new Set(seriesIds)];
}

export function applyMeasurementSeriesFilter(
  qb: SelectQueryBuilder<MeasurementEntity>,
  alias: string,
  seriesIds: string[],
): SelectQueryBuilder<MeasurementEntity> {
  if (!seriesIds.length) {
    return qb;
  }

  return qb.andWhere(`${measurementEffectiveSeriesIdSql(alias)} IN (:...seriesIds)`, {
    seriesIds,
  });
}
