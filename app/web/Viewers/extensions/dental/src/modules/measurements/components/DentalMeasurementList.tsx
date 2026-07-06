import React from 'react';
import { useSystem } from '@ohif/core';
import { useMeasurementActions } from '../hooks/useMeasurementActions';
import DentalMeasurementRow from './DentalMeasurementRow';

type DentalMeasurementListProps = {
  items: Record<string, unknown>[];
  pageOffset?: number;
  selectedUids: Set<string>;
  onToggleSelect: (uid: string, checked: boolean, item?: Record<string, unknown>) => void;
};

function DentalMeasurementList({
  items,
  pageOffset = 0,
  selectedUids,
  onToggleSelect,
}: DentalMeasurementListProps) {
  const { runAction } = useMeasurementActions(items);

  return (
    <div
      className="space-y-1"
      data-cy="dental-measurement-list"
    >
      {items.map((item, index) => {
        const uid = String(item.uid);

        return (
          <DentalMeasurementRow
            key={uid}
            item={item}
            index={pageOffset + index}
            isChecked={selectedUids.has(uid)}
            onToggleSelect={checked => onToggleSelect(uid, checked, item)}
            onJump={() => runAction('jumpToMeasurement', uid)}
            onRename={() => runAction('renameMeasurement', uid)}
            onDelete={() => runAction('removeMeasurement', uid)}
          />
        );
      })}
    </div>
  );
}

export default DentalMeasurementList;
