/**
 * Measurements Palette Component
 * Overlay palette with dental measurement presets
 */

import React, { useState } from 'react';
import { DENTAL_MEASUREMENTS } from '../constants/measurements';

interface MeasurementsPaletteProps {
  servicesManager?: any;
  onMeasurementSelect?: (preset: string) => void;
}

export default function MeasurementsPalette({
  servicesManager,
  onMeasurementSelect,
}: MeasurementsPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (presetId: string) => {
    setSelectedPreset(presetId);
    onMeasurementSelect?.(presetId);
    // TODO: Activate measurement tool based on preset
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        📏 Measurements
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '100px',
        left: '20px',
        backgroundColor: 'white',
        border: '2px solid #0066cc',
        borderRadius: '8px',
        padding: '16px',
        width: '280px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0066cc' }}>Measurements Palette</h3>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#666',
          }}
        >
          ✕
        </button>
      </div>

      {/* Presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {DENTAL_MEASUREMENTS.map((measurement) => (
          <button
            key={measurement.id}
            onClick={() => handlePresetClick(measurement.id)}
            style={{
              padding: '10px 12px',
              backgroundColor: selectedPreset === measurement.id ? '#e0e7ff' : '#f5f5f5',
              border: selectedPreset === measurement.id ? '2px solid #0066cc' : '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: '8px' }}>{measurement.icon}</span>
            {measurement.name} ({measurement.unit})
          </button>
        ))}
      </div>

      {/* Instructions */}
      {selectedPreset && (
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fffacd', borderRadius: '4px', fontSize: '12px', color: '#333' }}>
          ℹ️ Click on the image to set measurement points
        </div>
      )}
    </div>
  );
}
