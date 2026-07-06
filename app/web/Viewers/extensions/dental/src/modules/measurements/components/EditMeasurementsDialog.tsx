import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
} from '@ohif/ui-next';
import { dentalPanelInputClassName, dentalPanelScrollAreaClassName } from '../../../shared/components/dentalPanelStyles';
import { editMeasurementsSchema } from '../schemas/measurement.schema';

export type EditMeasurementItem = {
  uid: string;
  label: string;
  value: string;
};

type EditMeasurementsDialogProps = {
  open: boolean;
  items: EditMeasurementItem[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: Array<{ uid: string; label: string }>) => void;
};

function EditMeasurementsDialog({
  open,
  items,
  isSaving,
  onOpenChange,
  onSave,
}: EditMeasurementsDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editMeasurementsSchema),
    defaultValues: { items: [] as EditMeasurementItem[] },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({ items });
  }, [open, items, reset]);

  const onSubmit = handleSubmit(data => {
    const updates = data.items
      .map(item => ({
        uid: item.uid,
        label: item.label.trim(),
      }))
      .filter(update => update.label.length > 0);

    if (!updates.length) {
      return;
    }

    onSave(updates);
  });

  const measurementWord = items.length === 1 ? 'measurement' : 'measurements';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="border-border/60 bg-background text-foreground flex max-h-[min(32rem,85vh)] max-w-md flex-col gap-0 overflow-hidden rounded-lg border p-0 shadow-xl">
        <DialogHeader className="border-border/50 shrink-0 space-y-1.5 border-b px-4 py-3.5 text-left">
          <DialogTitle className="text-foreground text-sm font-semibold leading-none">
            Edit {measurementWord}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            Update the display names for the selected {measurementWord}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={dentalPanelScrollAreaClassName}>
          <form
            id="dental-edit-measurements-form"
            onSubmit={onSubmit}
            className="px-4 py-3"
          >
            {items.length === 0 ? (
              <p className="text-muted-foreground text-xs">No measurements selected.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.uid}
                    className="border-border/50 bg-muted/10 rounded-md border px-3 py-2.5"
                    data-cy={`dental-edit-row-${index}`}
                  >
                    {item.value ? (
                      <p
                        className="text-muted-foreground mb-2 truncate text-[10px] leading-none"
                        title={item.value}
                      >
                        {item.value}
                      </p>
                    ) : null}
                    <label
                      htmlFor={`dental-edit-label-${item.uid}`}
                      className="text-muted-foreground mb-1 block text-[10px] font-medium leading-none"
                    >
                      Name
                    </label>
                    <input
                      id={`dental-edit-label-${item.uid}`}
                      type="text"
                      className={dentalPanelInputClassName}
                      defaultValue={item.label}
                      {...register(`items.${index}.label` as const)}
                      disabled={isSaving}
                      data-cy={`dental-edit-label-${index}`}
                    />
                    <input
                      type="hidden"
                      {...register(`items.${index}.uid` as const)}
                      value={item.uid}
                    />
                    {errors.items?.[index]?.label && (
                      <p className="text-destructive mt-1 text-[10px]">
                        {errors.items[index]?.label?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </form>
        </ScrollArea>

        <DialogFooter className="bg-muted/10 border-border/50 flex shrink-0 flex-row justify-end gap-2 border-t px-4 py-3 sm:space-x-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            data-cy="dental-edit-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            type="submit"
            form="dental-edit-measurements-form"
            disabled={isSaving || items.length === 0}
            data-cy="dental-edit-save"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditMeasurementsDialog;
