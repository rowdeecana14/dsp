/**
 * Dental Measurements Presets
 * Defines all available dental measurement types
 */

export interface DentalMeasurement {
  id: string;
  name: string;
  label: string;
  unit: string;
  tool: 'distance' | 'angle' | 'ellipse' | 'rectangle';
  icon: string;
  description: string;
}

export const DENTAL_MEASUREMENTS: DentalMeasurement[] = [
  {
    id: 'pa_length',
    name: 'Periapical Length',
    label: 'PA length',
    unit: 'mm',
    tool: 'distance',
    icon: '📏',
    description: 'Measure the length of the root from apex to crown',
  },
  {
    id: 'canal_angle',
    name: 'Canal Angle',
    label: 'Canal angle',
    unit: '°',
    tool: 'angle',
    icon: '∠',
    description: 'Measure the angle of the root canal',
  },
  {
    id: 'crown_width',
    name: 'Crown Width',
    label: 'Crown width',
    unit: 'mm',
    tool: 'distance',
    icon: '👑',
    description: 'Measure the mesiodistal width of the crown',
  },
  {
    id: 'root_length',
    name: 'Root Length',
    label: 'Root length',
    unit: 'mm',
    tool: 'distance',
    icon: '🦷',
    description: 'Measure the length of the root',
  },
  {
    id: 'bone_loss',
    name: 'Bone Loss',
    label: 'Bone loss',
    unit: 'mm',
    tool: 'distance',
    icon: '📉',
    description: 'Measure the amount of bone loss',
  },
  {
    id: 'alveolar_crest',
    name: 'Alveolar Crest',
    label: 'Alveolar crest',
    unit: 'mm',
    tool: 'distance',
    icon: '🦴',
    description: 'Measure the alveolar crest level',
  },
];

export const MEASUREMENT_TOOLS = {
  distance: 'LengthTool',
  angle: 'AngleTool',
  ellipse: 'EllipseRoiTool',
  rectangle: 'RectangleRoiTool',
};
