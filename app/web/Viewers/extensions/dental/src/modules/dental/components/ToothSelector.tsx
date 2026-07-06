import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ohif/ui-next';
import {
  ToothSystem,
  getTeethForSystem,
  convertTooth,
  formatToothLabel,
} from '../../../shared/utils/toothNumbering';

type ToothSelectorProps = {
  selectedTooth: string;
  toothSystem: ToothSystem;
  onToothChange: (tooth: string) => void;
  onSystemChange: (system: ToothSystem) => void;
};

function ToothSelector({
  selectedTooth,
  toothSystem,
  onToothChange,
  onSystemChange,
}: ToothSelectorProps) {
  const teeth = getTeethForSystem(toothSystem);

  const handleSystemChange = (newSystem: ToothSystem) => {
    const converted = convertTooth(selectedTooth, toothSystem, newSystem);
    onSystemChange(newSystem);
    onToothChange(converted);
  };

  const quadrants =
    toothSystem === 'FDI'
      ? [
          { id: 'UR', label: 'Upper right', prefix: '1' },
          { id: 'UL', label: 'Upper left', prefix: '2' },
          { id: 'LL', label: 'Lower left', prefix: '3' },
          { id: 'LR', label: 'Lower right', prefix: '4' },
        ]
      : [
          { id: 'UR', label: 'Upper right', teeth: ['1', '2', '3', '4', '5', '6', '7', '8'] },
          { id: 'UL', label: 'Upper left', teeth: ['9', '10', '11', '12', '13', '14', '15', '16'] },
          { id: 'LL', label: 'Lower left', teeth: ['17', '18', '19', '20', '21', '22', '23', '24'] },
          { id: 'LR', label: 'Lower right', teeth: ['25', '26', '27', '28', '29', '30', '31', '32'] },
        ];

  const teethForQuadrant = (quadrant: (typeof quadrants)[number]) => {
    if (toothSystem === 'FDI') {
      const prefix = (quadrant as { prefix: string }).prefix;
      return teeth.filter(t => t.startsWith(prefix));
    }
    return (quadrant as { teeth: string[] }).teeth;
  };

  return (
    <div
      className="flex shrink-0 items-center gap-3"
      data-cy="tooth-selector"
    >
      <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
        Tooth
      </p>
      <div className="flex items-center gap-1.5">
        <Select
          value={selectedTooth}
          onValueChange={onToothChange}
        >
          <SelectTrigger
            className="bg-muted/30 border-border/60 text-foreground h-8 w-[108px] border px-2.5 text-xs shadow-none"
            aria-label="Select tooth"
          >
            <SelectValue>{formatToothLabel(selectedTooth, toothSystem)}</SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {quadrants.map(quadrant => (
              <div key={quadrant.id}>
                <div className="text-muted-foreground px-2 py-1.5 text-[10px] font-medium">
                  {quadrant.label}
                </div>
                {teethForQuadrant(quadrant).map(tooth => (
                  <SelectItem
                    key={tooth}
                    value={tooth}
                    className="text-xs"
                  >
                    {formatToothLabel(tooth, toothSystem)}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={toothSystem}
          onValueChange={value => handleSystemChange(value as ToothSystem)}
        >
          <SelectTrigger
            className="bg-muted/30 border-border/60 text-foreground h-8 w-[88px] border px-2.5 text-xs shadow-none"
            aria-label="Numbering system"
          >
            <SelectValue>{toothSystem}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FDI">FDI</SelectItem>
            <SelectItem value="Universal">Universal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default ToothSelector;
