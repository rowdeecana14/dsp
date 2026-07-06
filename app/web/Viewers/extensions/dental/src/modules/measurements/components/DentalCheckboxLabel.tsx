import React from 'react';
import classNames from 'classnames';
import { Checkbox } from '@ohif/ui-next';
import { dentalPanelCheckboxClassName, dentalPanelMetaTextClassName } from '../../../shared/components/dentalPanelStyles';

type DentalCheckboxLabelProps = {
  checked: boolean | 'indeterminate';
  onCheckedChange: (checked: boolean) => void;
  label: string;
  className?: string;
  labelClassName?: string;
  id?: string;
  'data-cy'?: string;
};

function DentalCheckboxLabel({
  checked,
  onCheckedChange,
  label,
  className,
  labelClassName,
  id,
  'data-cy': dataCy,
}: DentalCheckboxLabelProps) {
  return (
    <label
      htmlFor={id}
      className={classNames(
        'flex cursor-pointer items-center gap-2.5',
        className
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={value => onCheckedChange(value === true)}
        data-cy={dataCy}
        className={dentalPanelCheckboxClassName}
      />
      <span
        className={classNames(
          dentalPanelMetaTextClassName,
          'text-xs leading-none',
          labelClassName
        )}
      >
        {label}
      </span>
    </label>
  );
}

export default DentalCheckboxLabel;
