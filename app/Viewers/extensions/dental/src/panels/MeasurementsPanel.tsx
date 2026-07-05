/**
 * Measurements Panel Component
 * Right-side panel displaying captured measurements with sorting and filtering
 */

import React, { useState } from 'react';
import { useMeasurements } from '../hooks/useMeasurements';

interface MeasurementsPanelProps {
  servicesManager?: any;
}

export default function MeasurementsPanel({ servicesManager }: MeasurementsPanelProps) {
  const { measurements, removeMeasurement, clearAll, exportJSON } = useMeasurements();
  const [sortBy, setSortBy] = useState<'label' | 'value' | 'time'>('time');
  const [filterBy, setFilterBy] = useState<'all' | 'distance' | 'angle'>('all');

  const filteredMeasurements = measurements.filter((m) => {
    if (filterBy === 'all') return true;
    return m.tool === filterBy;
  });

  const sortedMeasurements = [...filteredMeasurements].sort((a, b) => {
    switch (sortBy) {
      case 'label':
        return a.label.localeCompare(b.label);
      case 'value':
        return parseFloat(a.value) - parseFloat(b.value);
      case 'time':
        return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          backgroundColor: '#0066cc',
          color: 'white',
          borderBottom: '2px solid #ffa500',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          Measurements ({measurements.length})
        </h3>
      </div>

      {/* Controls */}
      <div style={{ padding: '12px', display: 'flex', gap: '8px', borderBottom: '1px solid #ddd' }}>
        <div>
          <label style={{ fontSize: '11px', color: '#666' }}>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ fontSize: '12px', padding: '2px', marginLeft: '4px' }}
          >
            <option value="time">Time</option>
            <option value="label">Label (A-Z)</option>
            <option value="value">Value</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#666' }}>Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            style={{ fontSize: '12px', padding: '2px', marginLeft: '4px' }}
          >
            <option value="all">All</option>
            <option value="distance">Distance</option>
            <option value="angle">Angle</option>
          </select>
        </div>
      </div>

      {/* Measurements List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {sortedMeasurements.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            No measurements yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sortedMeasurements.map((measurement) => (
              <div
                key={measurement.id}
                style={{
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong>{measurement.label}:</strong> {measurement.value} {measurement.unit}
                  <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                    {new Date(measurement.capturedAt).toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => removeMeasurement(measurement.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#d32f2f',
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px', display: 'flex', gap: '8px', borderTop: '1px solid #ddd' }}>
        <button
          onClick={() => exportJSON(measurements)}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
          disabled={measurements.length === 0}
        >
          📥 Export JSON
        </button>
        <button
          onClick={() => clearAll()}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          disabled={measurements.length === 0}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
