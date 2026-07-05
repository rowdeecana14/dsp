import React from 'react';
import { Icons } from '@ohif/ui-next';
import { getTeethForSystem, ToothSystem } from '../utils/toothNumbering';

export interface ToothSelectorProps {
  selectedTooth: string;
  toothSystem: ToothSystem;
  onToothChange: (tooth: string) => void;
  onSystemChange: (system: ToothSystem) => void;
}

export default function ToothSelector({
  selectedTooth,
  toothSystem,
  onToothChange,
  onSystemChange,
}: ToothSelectorProps) {
  const teeth = getTeethForSystem(toothSystem);

  return (
    <div className="flex items-center gap-2 rounded-md border border-dental-accent/30 bg-dental-surface px-2 py-1">
      <Icons.ToolLayout className="text-dental-accent h-4 w-4" />
      <span className="text-dental-muted text-xs font-medium uppercase tracking-wide">Tooth</span>
      <select
        className="bg-dental-surface text-foreground rounded border border-dental-accent/20 px-1 py-0.5 text-sm"
        value={selectedTooth}
        onChange={e => onToothChange(e.target.value)}
        data-cy="tooth-selector"
      >
        {teeth.map(tooth => (
          <option key={tooth} value={tooth}>
            {tooth}
          </option>
        ))}
      </select>
      <div className="flex rounded border border-dental-accent/20 text-xs">
        {(['FDI', 'Universal'] as ToothSystem[]).map(system => (
          <button
            key={system}
            type="button"
            className={`px-2 py-0.5 ${
              toothSystem === system
                ? 'bg-dental-accent text-white'
                : 'text-dental-muted hover:bg-dental-accent/10'
            }`}
            onClick={() => onSystemChange(system)}
            data-cy={`tooth-system-${system}`}
          >
            {system}
          </button>
        ))}
      </div>
    </div>
  );
}
