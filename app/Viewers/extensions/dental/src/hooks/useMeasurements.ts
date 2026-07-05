/**
 * useMeasurements Hook
 * Custom hook for managing dental measurements state and persistence
 */

import { useState, useCallback } from 'react';

export interface Measurement {
  id: string;
  label: string;
  value: string;
  unit: string;
  tool: 'distance' | 'angle' | 'ellipse' | 'rectangle';
  capturedAt: string;
  coordinates?: any;
}

export function useMeasurements(studyInstanceUID?: string) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements((prev) => [...prev, measurement]);
    // TODO: Persist to backend
  }, []);

  const removeMeasurement = useCallback((id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
    // TODO: Persist to backend
  }, []);

  const clearAll = useCallback(() => {
    setMeasurements([]);
    // TODO: Persist to backend
  }, []);

  const exportJSON = useCallback((toExport: Measurement[] = measurements) => {
    const data = {
      export: {
        timestamp: new Date().toISOString(),
        userId: 'user@example.com', // TODO: Get from auth service
        studyInstanceUID: studyInstanceUID || 'unknown',
        patientName: 'John Doe', // TODO: Get from displaySetService
        patientID: 'P123', // TODO: Get from displaySetService
        measurements: toExport,
      },
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-${studyInstanceUID}-measurements-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [measurements, studyInstanceUID]);

  return {
    measurements,
    addMeasurement,
    removeMeasurement,
    clearAll,
    exportJSON,
  };
}
