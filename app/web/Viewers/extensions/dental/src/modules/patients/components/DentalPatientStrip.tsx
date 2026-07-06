import React from 'react';
import { Icons } from '@ohif/ui-next';
import { usePatientInfo } from '../hooks/usePatientInfo';

function DentalPatientStrip() {
  const { patientInfo, isMixedPatients } = usePatientInfo();

  if (!patientInfo.PatientName && !patientInfo.PatientID) {
    return (
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        data-cy="dental-patient-info"
      >
        <Icons.Patient className="text-primary/70 h-5 w-5 shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
            Patient
          </p>
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (isMixedPatients) {
    return (
      <div
        className="flex min-w-0 flex-1 items-center gap-3"
        data-cy="dental-patient-info"
      >
        <Icons.MultiplePatients className="text-primary/70 h-5 w-5 shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
            Patient
          </p>
          <p className="text-foreground text-sm font-medium">Multiple patients</p>
        </div>
      </div>
    );
  }

  const meta = [
    patientInfo.PatientID ? `ID ${patientInfo.PatientID}` : null,
    patientInfo.PatientSex || null,
    patientInfo.PatientDOB ? `DOB ${patientInfo.PatientDOB}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');

  return (
    <div
      className="flex min-w-0 flex-1 items-center gap-3"
      data-cy="dental-patient-info"
    >
      <Icons.Patient className="text-primary/70 h-5 w-5 shrink-0" />
      <div className="min-w-0 leading-tight">
        <p className="text-muted-foreground text-[10px] font-medium tracking-[0.14em] uppercase">
          Patient
        </p>
        <p className="text-foreground truncate text-sm font-medium">
          {patientInfo.PatientName}
        </p>
        {meta && (
          <p className="text-muted-foreground truncate text-xs">{meta}</p>
        )}
      </div>
    </div>
  );
}

export default DentalPatientStrip;
