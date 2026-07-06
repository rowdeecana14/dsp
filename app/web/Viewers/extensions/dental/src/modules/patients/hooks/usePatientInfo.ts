import { useEffect, useState } from 'react';
import { utils, useSystem } from '@ohif/core';

const { formatPN, formatDate } = utils;

export type PatientInfo = {
  PatientName: string;
  PatientID: string;
  PatientSex: string;
  PatientDOB: string;
};

function readPatientFromDisplaySets(displaySetService: {
  getActiveDisplaySets: () => Array<{
    instances?: Array<Record<string, unknown>>;
    instance?: Record<string, unknown>;
  }>;
}): { patientInfo: PatientInfo; isMixedPatients: boolean } {
  const displaySets = displaySetService.getActiveDisplaySets();
  const empty: PatientInfo = {
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientDOB: '',
  };

  if (!displaySets.length) {
    return { patientInfo: empty, isMixedPatients: false };
  }

  const first = displaySets[0];
  const instance = first?.instances?.[0] || first?.instance;
  if (!instance) {
    return { patientInfo: empty, isMixedPatients: false };
  }

  const patientId = instance.PatientID || '';
  const isMixedPatients = displaySets.some(ds => {
    const inst = ds?.instances?.[0] || ds?.instance;
    return inst && inst.PatientID !== patientId;
  });

  return {
    patientInfo: {
      PatientID: patientId,
      PatientName: instance.PatientName ? formatPN(instance.PatientName) : '',
      PatientSex: instance.PatientSex || '',
      PatientDOB: formatDate(instance.PatientBirthDate) || '',
    },
    isMixedPatients,
  };
}

export function usePatientInfo() {
  const { servicesManager } = useSystem();
  const { displaySetService } = servicesManager.services;

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    PatientName: '',
    PatientID: '',
    PatientSex: '',
    PatientDOB: '',
  });
  const [isMixedPatients, setIsMixedPatients] = useState(false);

  useEffect(() => {
    const sync = () => {
      const { patientInfo: next, isMixedPatients: mixed } =
        readPatientFromDisplaySets(displaySetService);
      setPatientInfo(next);
      setIsMixedPatients(mixed);
    };

    sync();

    const { unsubscribe: unsubAdded } = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_ADDED,
      sync
    );
    const { unsubscribe: unsubChanged } = displaySetService.subscribe(
      displaySetService.EVENTS.DISPLAY_SETS_CHANGED,
      sync
    );

    return () => {
      unsubAdded();
      unsubChanged();
    };
  }, [displaySetService]);

  return { patientInfo, isMixedPatients };
}
