import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Header, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { preserveQueryParameters } from '@ohif/app';
import { Toolbar, usePatientInfo } from '@ohif/extension-default';
import ToothSelector from './ToothSelector';
import DentalThemeToggle, { applyDentalTheme, DentalTheme } from './DentalThemeToggle';
import { ToothSystem } from '../utils/toothNumbering';
import { saveViewerState } from '../services/dentalApiService';

export interface PracticeHeaderState {
  practiceName: string;
  selectedTooth: string;
  toothSystem: ToothSystem;
  theme: DentalTheme;
}

interface PracticeHeaderProps extends withAppTypes<{ appConfig: AppTypes.Config }> {
  practiceName?: string;
  headerState?: PracticeHeaderState;
  onHeaderStateChange?: (state: PracticeHeaderState) => void;
}

function PatientInfoBadge({ servicesManager }: { servicesManager: AppTypes.ServicesManager }) {
  const { patientInfo } = usePatientInfo(servicesManager);
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1">
      <Icons.Patient className="text-dental-accent h-4 w-4" />
      <div className="text-xs leading-tight">
        <div className="font-semibold">{patientInfo.PatientName || '—'}</div>
        <div className="text-dental-muted">
          {patientInfo.PatientID} · {patientInfo.PatientSex} · {patientInfo.PatientDOB}
        </div>
      </div>
    </div>
  );
}

function PracticeHeader({
  appConfig,
  practiceName = 'Bright Smile Dental',
  headerState,
  onHeaderStateChange,
}: PracticeHeaderProps) {
  const { servicesManager, commandsManager } = useSystem();
  const navigate = useNavigate();
  const location = useLocation();

  const [localState, setLocalState] = useState<PracticeHeaderState>(
    headerState ?? {
      practiceName,
      selectedTooth: '14',
      toothSystem: 'FDI',
      theme: 'clinical',
    }
  );

  const state = headerState ?? localState;

  const updateState = (partial: Partial<PracticeHeaderState>) => {
    const next = { ...state, ...partial };
    if (!headerState) {
      setLocalState(next);
    }
    onHeaderStateChange?.(next);
    if (partial.theme) {
      applyDentalTheme(partial.theme);
    }
  };

  useEffect(() => {
    applyDentalTheme(state.theme);
  }, [state.theme]);

  const onClickReturnButton = () => {
    const { pathname } = location;
    const dataSourceIdx = pathname.indexOf('/', 1);
    const searchQuery = new URLSearchParams();
    if (dataSourceIdx !== -1) {
      searchQuery.append('datasources', pathname.substring(dataSourceIdx + 1));
    }
    preserveQueryParameters(searchQuery);
    navigate({ pathname: '/', search: decodeURIComponent(searchQuery.toString()) });
  };

  const persistState = async () => {
    const studyInstanceUid = new URLSearchParams(window.location.search).get('StudyInstanceUIDs');
    if (!studyInstanceUid) {
      return;
    }
    try {
      await saveViewerState({
        study_instance_uid: studyInstanceUid.split(',')[0],
        mode: 'dental',
        theme: state.theme,
        selected_tooth: state.selectedTooth,
        tooth_system: state.toothSystem,
        viewport_layout: 'dental-2x2',
      });
    } catch (err) {
      console.warn('Failed to persist viewer state', err);
    }
  };

  return (
    <Header
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      WhiteLabeling={{
        ...appConfig.whiteLabeling,
        createLogoComponentFn: React => {
          return React.createElement(
            'div',
            { className: 'flex items-center gap-2' },
            React.createElement(Icons.ToolLayout, { className: 'text-dental-accent h-6 w-6' }),
            React.createElement(
              'span',
              { className: 'text-dental-accent font-semibold tracking-tight' },
              state.practiceName
            )
          );
        },
      }}
      Secondary={
        <div className="flex items-center gap-2">
          <DentalThemeToggle
            theme={state.theme}
            onToggle={theme => {
              updateState({ theme });
              persistState();
            }}
          />
          <ToothSelector
            selectedTooth={state.selectedTooth}
            toothSystem={state.toothSystem}
            onToothChange={tooth => {
              updateState({ selectedTooth: tooth });
              persistState();
            }}
            onSystemChange={system => {
              updateState({ toothSystem: system });
              persistState();
            }}
          />
          <Toolbar buttonSection="secondary" />
        </div>
      }
      PatientInfo={
        appConfig.showPatientInfo !== 'disabled' && (
          <PatientInfoBadge servicesManager={servicesManager} />
        )
      }
      UndoRedo={
        <div className="text-primary flex cursor-pointer items-center">
          <Button variant="ghost" className="hover:bg-muted" onClick={() => commandsManager.run('undo')}>
            <Icons.Undo />
          </Button>
          <Button variant="ghost" className="hover:bg-muted" onClick={() => commandsManager.run('redo')}>
            <Icons.Redo />
          </Button>
        </div>
      }
    >
      <div className="relative flex justify-center gap-1">
        <Toolbar buttonSection="primary" />
      </div>
    </Header>
  );
}

export default PracticeHeader;
