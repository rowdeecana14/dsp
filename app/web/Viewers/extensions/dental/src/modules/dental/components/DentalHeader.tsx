import React, { ReactNode } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
  Button,
  ToolButton,
} from '@ohif/ui-next';
import { IconPresentationProvider } from '@ohif/ui-next';
import NavBar from '../../../../../../platform/ui-next/src/components/NavBar';
import DentalToothIcon from './DentalToothIcon';

interface DentalHeaderProps {
  children?: ReactNode;
  practiceName: string;
  practiceBar: ReactNode;
  headerActions?: ReactNode;
  menuOptions: Array<{
    title: string;
    icon?: string;
    onClick: () => void;
  }>;
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  isSticky?: boolean;
  UndoRedo?: ReactNode;
}

function DentalHeader({
  children,
  practiceName,
  practiceBar,
  headerActions,
  menuOptions,
  isReturnEnabled = true,
  onClickReturnButton,
  isSticky = false,
  UndoRedo,
  ...props
}: DentalHeaderProps): ReactNode {
  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  return (
    <IconPresentationProvider
      size="large"
      IconContainer={ToolButton}
    >
      <NavBar
        isSticky={isSticky}
        className="border-border/80 border-b"
        data-cy="practice-header"
        {...props}
      >
        <div className="bg-background/95 flex h-14 items-stretch backdrop-blur-sm">
          <div
            className={classNames(
              'border-border/60 flex shrink-0 items-center gap-2.5 border-r px-4',
              isReturnEnabled && 'cursor-pointer'
            )}
            onClick={onClickReturn}
            data-cy="return-to-work-list"
          >
            {isReturnEnabled && (
              <Icons.ArrowLeft className="text-muted-foreground hover:text-primary h-5 w-5 shrink-0 transition-colors" />
            )}
            <DentalToothIcon className="text-primary h-6 w-6 shrink-0" />
            <p
              className="text-foreground max-w-[220px] truncate text-sm font-semibold leading-tight tracking-wide"
              data-cy="practice-name"
              title={practiceName}
            >
              {practiceName}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto px-5">
            {practiceBar}
          </div>

          <div className="border-border/60 flex shrink-0 items-center gap-2 border-l px-3">
            {UndoRedo}
            {headerActions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-muted/60 h-9 w-9"
                >
                  <Icons.GearSettings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {menuOptions.map((option, index) => (
                  <DropdownMenuItem
                    key={index}
                    onSelect={option.onClick}
                    className="flex items-center gap-2 py-2"
                  >
                    {option.icon && (
                      <span className="flex h-4 w-4 items-center justify-center">
                        <Icons.ByName name={option.icon} />
                      </span>
                    )}
                    <span className="flex-1">{option.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-muted/15 border-border/60 relative flex h-12 items-center justify-center overflow-x-auto px-4">
          {children}
        </div>
      </NavBar>
    </IconPresentationProvider>
  );
}

export default DentalHeader;
