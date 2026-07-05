import React, { useEffect, useMemo, useState } from 'react';
import { Button, Icons } from '@ohif/ui-next';
import { dentalMeasurementStore, DentalMeasurement } from '../services/dentalMeasurementStore';
import { exportMeasurementsJson, saveMeasurementsToApi } from '../services/dentalApiService';

type SortField = 'label' | 'value' | 'capturedAt';
type SortDir = 'asc' | 'desc';

export default function DentalMeasurementsPanel() {
  const [measurements, setMeasurements] = useState<DentalMeasurement[]>([]);
  const [filter, setFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('capturedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    setMeasurements(dentalMeasurementStore.getMeasurements());
    return dentalMeasurementStore.subscribe(() => {
      setMeasurements(dentalMeasurementStore.getMeasurements());
    });
  }, []);

  const filtered = useMemo(() => {
    const term = filter.toLowerCase();
    const list = term
      ? measurements.filter(
          m =>
            m.label.toLowerCase().includes(term) ||
            m.tool.toLowerCase().includes(term) ||
            m.value.includes(term)
        )
      : [...measurements];

    list.sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [measurements, filter, sortField, sortDir]);

  const studyInstanceUid =
    new URLSearchParams(window.location.search).get('StudyInstanceUIDs')?.split(',')[0] ?? '';

  const handleExport = () => {
    exportMeasurementsJson(studyInstanceUid, 'Bright Smile Dental');
    setSyncStatus('Exported JSON');
    setTimeout(() => setSyncStatus(null), 2000);
  };

  const handleSync = async () => {
    if (!studyInstanceUid || measurements.length === 0) {
      return;
    }
    try {
      await saveMeasurementsToApi(studyInstanceUid, measurements);
      setSyncStatus('Saved to server');
    } catch (err) {
      setSyncStatus('Sync failed — login required');
    }
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="flex h-full flex-col bg-background p-3" data-cy="dental-measurements-panel">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-dental-accent text-sm font-semibold">Measurements</h2>
        <span className="text-dental-muted text-xs">{filtered.length} items</span>
      </div>

      <input
        type="text"
        placeholder="Filter by label, tool, value..."
        className="border-dental-accent/20 mb-2 w-full rounded border bg-muted px-2 py-1 text-sm"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        data-cy="measurements-filter"
      />

      <div className="text-dental-muted mb-2 flex gap-2 text-xs">
        <button type="button" onClick={() => toggleSort('label')}>
          Label {sortField === 'label' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button type="button" onClick={() => toggleSort('value')}>
          Value {sortField === 'value' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button type="button" onClick={() => toggleSort('capturedAt')}>
          Time {sortField === 'capturedAt' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="text-dental-muted text-sm">No measurements yet. Use the Measurements palette.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map(m => (
              <li
                key={m.uid}
                className="border-dental-accent/20 rounded-md border bg-muted/50 p-2 text-sm"
                data-cy={`measurement-item-${m.uid}`}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-dental-accent">
                  {m.value} {m.unit}
                </div>
                <div className="text-dental-muted text-xs">
                  {m.tool} · {new Date(m.capturedAt).toLocaleTimeString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <Button variant="default" size="sm" onClick={handleExport} data-cy="export-json-btn">
          <Icons.Export className="mr-1 h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={handleSync} data-cy="sync-measurements-btn">
          Save to Server
        </Button>
        {syncStatus && <span className="text-dental-muted text-xs">{syncStatus}</span>}
      </div>
    </div>
  );
}
