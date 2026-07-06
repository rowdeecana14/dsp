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
      <header
        className={classNames(
          'bg-background border-border/80 z-20 w-full shrink-0 border-b',
          isSticky && 'sticky top-0',
          !isSticky && 'relative'
        )}
        data-cy="practice-header"
        {...props}
      >
        <div className="bg-background/95 flex h-14 w-full items-stretch backdrop-blur-sm">
          <div
            className={classNames(
              'border-border/60 flex shrink-0 items-center gap-2 border-r pl-2.5 pr-4',
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
              className="text-foreground max-w-[200px] truncate text-sm font-semibold leading-tight tracking-wide sm:max-w-[240px]"
              data-cy="practice-name"
              title={practiceName}
            >
              {practiceName}
            </p>
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-4 overflow-hidden px-3">
            {practiceBar}
          </div>

          <div className="border-border/60 flex shrink-0 items-center gap-1 border-l pl-2 pr-1.5">
            {UndoRedo}
            {headerActions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-muted/60 h-9 w-9 shrink-0"
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

        {children ? (
          <div className="bg-muted/20 border-border/50 flex h-12 w-full items-center justify-center overflow-hidden border-t">
            {children}
          </div>
        ) : null}
      </header>
    </IconPresentationProvider>
  );
}

export default DentalHeader;
