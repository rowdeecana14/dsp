import { z } from 'zod';

export const toothSelectionSchema = z.object({
  selectedTooth: z.string().min(1),
  toothSystem: z.enum(['FDI', 'Universal']),
});

export const presetIdSchema = z.enum([
  'pa-length',
  'canal-angle',
  'crown-width',
  'root-length',
]);

export type ToothSelectionValues = z.infer<typeof toothSelectionSchema>;
