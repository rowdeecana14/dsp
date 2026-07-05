/**
 * Practice Header Component
 * Custom header displaying practice info, patient data, and tooth selector
 */

import React, { useState } from 'react';
import ToothSelector from './ToothSelector';

interface PracticeHeaderProps {
  servicesManager?: any;
}

export default function PracticeHeader({ servicesManager }: PracticeHeaderProps) {
  const [selectedTooth, setSelectedTooth] = useState<string>('11');
  const [toothSystem, setToothSystem] = useState<'FDI' | 'Universal'>('FDI');

  // TODO: Get patient data from displaySetService
  const patientName = 'John Doe';
  const patientID = 'P123';
  const patientDOB = '01/15/1985';
  const practiceName = 'Smile Dental Practice';
  const practiceLogoUrl = '/dental-logo.png';

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        backgroundColor: '#0066cc',
        color: 'white',
        borderBottom: '2px solid #ffa500',
      }}
    >
      {/* Left: Practice Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={practiceLogoUrl}
          alt="Practice Logo"
          style={{ height: '32px' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div>
          <h2 style={{ margin: 0, fontSize: '16px' }}>{practiceName}</h2>
        </div>
      </div>

      {/* Center: Patient Info */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '4px 0', fontSize: '14px' }}>
          Patient: {patientName} (ID: {patientID})
        </p>
        <p style={{ margin: '4px 0', fontSize: '12px', opacity: 0.9 }}>
          DOB: {patientDOB}
        </p>
      </div>

      {/* Right: Tooth Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ToothSelector
          selectedTooth={selectedTooth}
          toothSystem={toothSystem}
          onToothChange={setSelectedTooth}
          onSystemChange={setToothSystem}
        />
      </div>
    </header>
  );
}
