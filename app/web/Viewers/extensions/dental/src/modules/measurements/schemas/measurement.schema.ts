import { z } from 'zod';

export const measurementCoordinatesSchema = z.object({
  points: z.array(z.unknown()).optional(),
  frame_of_reference_uid: z.string().optional(),
  sop_instance_uid: z.string().optional(),
  referenced_image_id: z.string().optional(),
  display_set_instance_uid: z.string().optional(),
  is_locked: z.boolean().optional(),
  is_visible: z.boolean().optional(),
  series_id: z.string().optional(),
  series_instance_uid: z.string().optional(),
  reference_series_uid: z.string().optional(),
  dental_preset_id: z.string().optional(),
});

export const measurementRecordSchema = z.object({
  id: z.string().optional(),
  viewer_state_id: z.string().optional(),
  label: z.string(),
  value: z.string(),
  unit: z.string(),
  tool: z.string(),
  type: z.string().optional(),
  viewport: z.string().optional(),
  image_id: z.string().optional(),
  captured_at: z.string(),
  dental_preset_id: z.string().optional(),
  series_id: z.string().optional(),
  coordinates: measurementCoordinatesSchema.optional(),
});

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  last_page: z.number(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['ASC', 'DESC']).optional(),
});

export const studiesMeasurementsBodySchema = z.object({
  studies: z.array(
    z.object({
      study_instance_uid: z.string(),
      series: z.array(
        z.object({
          series_id: z.string(),
          measurements: z.array(measurementRecordSchema),
        })
      ),
    })
  ),
});

export const editMeasurementItemSchema = z.object({
  uid: z.string().min(1),
  label: z.string().min(1, 'Label is required'),
});

export const editMeasurementsSchema = z.object({
  items: z.array(editMeasurementItemSchema).min(1),
});

export type EditMeasurementItemValues = z.infer<typeof editMeasurementItemSchema>;
export type EditMeasurementsFormValues = z.infer<typeof editMeasurementsSchema>;
