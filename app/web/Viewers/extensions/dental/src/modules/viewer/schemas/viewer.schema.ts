import { z } from 'zod';

export const viewportConfigSchema = z.object({
  top_left: z.string().optional(),
  top_right: z.string().optional(),
  bottom_left: z.string().optional(),
  bottom_right: z.string().optional(),
  bottom: z.string().optional(),
});

export const viewerStatePayloadSchema = z.object({
  study_instance_uid: z.string().min(1),
  mode: z.string().optional(),
  theme: z.string().optional(),
  selected_tooth: z.string().optional(),
  tooth_system: z.enum(['FDI', 'Universal']).optional(),
  viewport_layout: z.string().optional(),
  patient_id: z.string().optional(),
  viewport_config: viewportConfigSchema.optional(),
});

export type ViewerStatePayloadValues = z.infer<typeof viewerStatePayloadSchema>;
