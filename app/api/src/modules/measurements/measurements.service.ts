import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MeasurementRepository } from './measurement.repository';
import { MeasurementEntity } from './entities/measurement.entity';
import {
  normalizeSaveMeasurementsInput,
  normalizeApiCoordinates,
  resolveSeriesId,
  entityToMeasurementRecord,
  resolveMeasurementType,
  type MeasurementRecord,
} from './measurements-schema';
import type { SaveMeasurementsDto } from './dto/save-measurements.dto';
import type { UpdateMeasurementDto } from './dto/update-measurement.dto';
import type { CreateMeasurementDto } from './dto/create-measurement.dto';
import type { PutMeasurementDto } from './dto/create-measurement.dto';
import { ViewerStateService } from '../viewer-state/viewer-state.service';

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly measurementRepository: MeasurementRepository,
    private readonly viewerStateService: ViewerStateService,
  ) {}

  async getMeasurements(studyInstanceUID: string, userId: string) {
    return this.measurementRepository.findByStudyAndUser(studyInstanceUID, userId);
  }

  async saveMeasurementsPayload(dto: SaveMeasurementsDto, userId: string) {
    const payloads = normalizeSaveMeasurementsInput(dto);
    if (!payloads.length) {
      throw new BadRequestException('No study measurements payload provided');
    }

    const saved: MeasurementEntity[] = [];

    for (const payload of payloads) {
      const entities = payload.measurements.map(measurement => {
        const seriesId = resolveSeriesId(measurement);
        const dentalPresetId = measurement.dental_preset_id ?? null;
        const coordinates = normalizeApiCoordinates(
          {
            ...(measurement.coordinates ?? {}),
            ...(dentalPresetId ? { dental_preset_id: dentalPresetId } : {}),
          },
          seriesId,
        );

        return {
          id: measurement.id,
          study_instance_uid: payload.study_instance_uid,
          series_id: seriesId,
          user_id: userId,
          label: measurement.label,
          value: measurement.value,
          unit: measurement.unit,
          tool: measurement.tool,
          captured_at: measurement.captured_at,
          dental_preset_id: dentalPresetId,
          type: resolveMeasurementType(dentalPresetId, measurement.type),
          viewport: measurement.viewport ?? null,
          image_id: measurement.image_id ?? null,
          viewer_state_id: measurement.viewer_state_id ?? null,
          coordinates,
        };
      }) as MeasurementEntity[];

      const studySaved = await this.measurementRepository.replaceMeasurementsForStudy(
        payload.study_instance_uid,
        userId,
        entities,
        userId,
      );
      saved.push(...studySaved);
    }

    return saved;
  }

  async updateMeasurement(id: string, userId: string, dto: UpdateMeasurementDto) {
    const entity = await this.measurementRepository.findByIdAndUser(id, userId);
    if (!entity) {
      throw new NotFoundException('Measurement not found');
    }

    const coordinates = { ...(entity.coordinates ?? {}) };

    switch (dto.action) {
      case 'rename': {
        if (!dto.label?.trim()) {
          throw new BadRequestException('label is required for rename action');
        }
        entity.label = dto.label.trim();
        break;
      }
      case 'lock': {
        if (dto.is_locked === undefined) {
          throw new BadRequestException('is_locked is required for lock action');
        }
        coordinates.is_locked = dto.is_locked;
        entity.coordinates = normalizeApiCoordinates(coordinates, entity.series_id);
        break;
      }
      case 'visible': {
        coordinates.is_visible = true;
        entity.coordinates = normalizeApiCoordinates(coordinates, entity.series_id);
        break;
      }
      case 'hide': {
        coordinates.is_visible = false;
        entity.coordinates = normalizeApiCoordinates(coordinates, entity.series_id);
        break;
      }
      default:
        throw new BadRequestException(`Unsupported action: ${dto.action}`);
    }

    const saved = await this.measurementRepository.saveMeasurement(entity);
    if (!saved) {
      throw new NotFoundException('Measurement not found');
    }
    return entityToMeasurementRecord(saved);
  }

  async bulkUpdateMeasurements(ids: string[], userId: string, dto: UpdateMeasurementDto) {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const updated: MeasurementRecord[] = [];
    const failed: string[] = [];

    for (const id of uniqueIds) {
      try {
        updated.push(await this.updateMeasurement(id, userId, dto));
      } catch {
        failed.push(id);
      }
    }

    return { updated, failed };
  }

  async saveMeasurements(studyInstanceUID: string, userId: string, measurements: any[]) {
    return this.saveMeasurementsPayload(
      {
        study_instance_uid: studyInstanceUID,
        measurements,
      },
      userId,
    );
  }

  async deleteMeasurement(id: string, userId: string) {
    return this.measurementRepository.deleteMeasurement(id, userId, userId);
  }

  async getMeasurementsByViewerState(viewerStateId: string, userId: string) {
    await this.viewerStateService.getStateById(viewerStateId, userId);
    return this.measurementRepository.findByViewerStateAndUser(viewerStateId, userId);
  }

  async createMeasurement(dto: CreateMeasurementDto, userId: string) {
    if (dto.viewer_state_id) {
      await this.viewerStateService.getStateById(dto.viewer_state_id, userId);
    }

    const seriesId = resolveSeriesId(dto);
    const dentalPresetId = dto.dental_preset_id ?? null;
    const entity = new MeasurementEntity();
    entity.study_instance_uid = dto.study_instance_uid;
    entity.user_id = userId;
    entity.viewer_state_id = dto.viewer_state_id ?? null;
    entity.label = dto.label.trim();
    entity.value = dto.value.trim();
    entity.unit = dto.unit.trim();
    entity.tool = dto.tool.trim();
    entity.captured_at = dto.captured_at ?? new Date().toISOString();
    entity.series_id = seriesId;
    entity.dental_preset_id = dentalPresetId;
    entity.type = resolveMeasurementType(dentalPresetId, dto.type);
    entity.viewport = dto.viewport ?? null;
    entity.image_id = dto.image_id ?? null;
    entity.coordinates = normalizeApiCoordinates(
      {
        ...(dto.coordinates ?? {}),
        ...(dentalPresetId ? { dental_preset_id: dentalPresetId } : {}),
      },
      seriesId,
    );

    const saved = await this.measurementRepository.createMeasurement(entity);
    return entityToMeasurementRecord(saved);
  }

  async putMeasurement(id: string, userId: string, dto: PutMeasurementDto) {
    const entity = await this.measurementRepository.findByIdAndUser(id, userId);
    if (!entity) {
      throw new NotFoundException('Measurement not found');
    }

    if (dto.label !== undefined) {
      entity.label = dto.label.trim();
    }
    if (dto.value !== undefined) {
      entity.value = dto.value.trim();
    }
    if (dto.unit !== undefined) {
      entity.unit = dto.unit.trim();
    }
    if (dto.tool !== undefined) {
      entity.tool = dto.tool.trim();
    }
    if (dto.type !== undefined) {
      entity.type = dto.type;
    }
    if (dto.viewport !== undefined) {
      entity.viewport = dto.viewport;
    }
    if (dto.image_id !== undefined) {
      entity.image_id = dto.image_id;
    }
    if (dto.dental_preset_id !== undefined) {
      entity.dental_preset_id = dto.dental_preset_id;
      entity.type = resolveMeasurementType(dto.dental_preset_id, dto.type ?? entity.type);
    }
    if (dto.coordinates !== undefined) {
      entity.coordinates = normalizeApiCoordinates(dto.coordinates, entity.series_id);
    }

    const saved = await this.measurementRepository.saveMeasurement(entity);
    if (!saved) {
      throw new NotFoundException('Measurement not found');
    }
    return entityToMeasurementRecord(saved);
  }
}
