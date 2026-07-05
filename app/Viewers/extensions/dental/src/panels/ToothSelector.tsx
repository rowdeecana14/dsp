/**
 * Tooth Selector Component
 * Allows selection of teeth using FDI or Universal numbering systems
 */

import React from 'react';

interface ToothSelectorProps {
  selectedTooth: string;
  toothSystem: 'FDI' | 'Universal';
  onToothChange: (tooth: string) => void;
  onSystemChange: (system: 'FDI' | 'Universal') => void;
}

const FDI_TEETH = Array.from({ length: 32 }, (_, i) => (i + 1).toString());
const UNIVERSAL_TEETH = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

export default function ToothSelector({
  selectedTooth,
  toothSystem,
  onToothChange,
  onSystemChange,
}: ToothSelectorProps) {
  const teeth = toothSystem === 'FDI' ? FDI_TEETH : UNIVERSAL_TEETH;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Tooth:</label>

      {/* System Toggle */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {(['FDI', 'Universal'] as const).map((system) => (
          <button
            key={system}
            onClick={() => onSystemChange(system)}
            style={{
              padding: '4px 8px',
              backgroundColor: toothSystem === system ? '#ffa500' : 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: toothSystem === system ? 'bold' : 'normal',
            }}
          >
            {system}
          </button>
        ))}
      </div>

      {/* Tooth Selector */}
      <select
        value={selectedTooth}
        onChange={(e) => onToothChange(e.target.value)}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        {teeth.map((tooth) => (
          <option key={tooth} value={tooth} style={{ color: 'black' }}>
            Tooth {tooth}
          </option>
        ))}
      </select>
    </div>
  );
}
