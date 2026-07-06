import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button, Icons } from '@ohif/ui-next';
import { useSystem } from '@ohif/core';
import { Toolbar } from '@ohif/extension-default';
import { preserveQueryParameters } from '@ohif/app';

import DentalHeader from './DentalHeader';
import DentalPatientStrip from '../../patients/components/DentalPatientStrip';
import { HeaderDivider } from '../../../shared';
import ThemeToggle from './ThemeToggle';
import ToothSelector from './ToothSelector';
import { useToothSelector, useDentalTheme } from '../hooks/useToothSelector';
import { useDentalBranding } from '../hooks/useDentalBranding';
import { useDentalPracticeMenuOptions } from '../hooks/useDentalPracticeMenuOptions';
import { initializeDentalBranding } from '../../../shared/utils/dentalBranding';

type PracticeHeaderProps = {
  appConfig: AppTypes.Config & { dentalPracticeName?: string; dentalPracticeLogo?: string };
};

function PracticeHeader({ appConfig }: PracticeHeaderProps) {
  const { commandsManager } = useSystem();
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedTooth, toothSystem, onToothChange, onSystemChange } = useToothSelector();
  const { onThemeChange } = useDentalTheme();
  const { practiceName, logoUrl } = useDentalBranding();
  const menuOptions = useDentalPracticeMenuOptions();

  const practiceNameFromConfig = appConfig.dentalPracticeName;
  const logoPathFromConfig = appConfig.dentalPracticeLogo;

  useEffect(() => {
    initializeDentalBranding({
      dentalPracticeName: practiceNameFromConfig,
      dentalPracticeLogo: logoPathFromConfig,
    });
  }, [practiceNameFromConfig, logoPathFromConfig]);

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

  return (
    <DentalHeader
      menuOptions={menuOptions}
      practiceName={practiceName}
      logoUrl={logoUrl}
      isReturnEnabled={!!appConfig.showStudyList}
      onClickReturnButton={onClickReturnButton}
      practiceBar={
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden sm:gap-4 lg:gap-5">
          <DentalPatientStrip />
          <HeaderDivider />
          <ToothSelector
            selectedTooth={selectedTooth}
            toothSystem={toothSystem}
            onToothChange={onToothChange}
            onSystemChange={onSystemChange}
          />
        </div>
      }
      headerActions={<ThemeToggle onThemeChange={onThemeChange} />}
      UndoRedo={
        <>
          <div className="bg-border/60 mx-1 hidden h-7 w-px shrink-0 lg:block" aria-hidden />
          <div className="text-muted-foreground flex shrink-0 items-center">
            <Button
              variant="ghost"
              className="hover:bg-muted/60 hover:text-primary h-9 w-9"
              data-cy="undo-btn"
              onClick={() => commandsManager.run('undo')}
            >
              <Icons.Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="hover:bg-muted/60 hover:text-primary h-9 w-9"
              data-cy="redo-btn"
              onClick={() => commandsManager.run('redo')}
            >
              <Icons.Redo className="h-4 w-4" />
            </Button>
          </div>
        </>
      }
    >
      <div className="flex h-full w-full min-w-0 items-center justify-center overflow-hidden px-2">
        <Toolbar buttonSection="primary" />
      </div>
    </DentalHeader>
  );
}

export default PracticeHeader;
