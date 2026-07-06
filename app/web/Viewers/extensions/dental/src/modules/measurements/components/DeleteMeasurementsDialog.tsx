import React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ohif/ui-next';

type DeleteMeasurementsDialogProps = {
  open: boolean;
  count: number;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

function DeleteMeasurementsDialog({
  open,
  count,
  isDeleting,
  onOpenChange,
  onConfirm,
}: DeleteMeasurementsDialogProps) {
  const measurementWord = count === 1 ? 'measurement' : 'measurements';

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="border-border/60 bg-background text-foreground max-w-sm gap-0 overflow-hidden rounded-lg border p-0 shadow-xl">
        <DialogHeader className="border-border/50 space-y-1.5 border-b px-4 py-3.5 text-left">
          <DialogTitle className="text-foreground text-sm font-semibold leading-none">
            Delete {measurementWord}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            {count === 0
              ? 'No measurements are selected.'
              : `Remove ${count} ${measurementWord} from this study. This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="bg-muted/10 flex flex-row justify-end gap-2 px-4 py-3 sm:space-x-0">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            data-cy="dental-delete-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={onConfirm}
            disabled={isDeleting || count === 0}
            data-cy="dental-delete-confirm"
          >
            {isDeleting ? 'Deleting…' : count > 0 ? `Delete (${count})` : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteMeasurementsDialog;
