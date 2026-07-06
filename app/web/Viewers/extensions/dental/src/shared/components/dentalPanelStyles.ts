/** Shared class names for dental panel controls — keeps the measurements UI consistent. */
export const dentalPanelInputClassName =
  'bg-input/80 border-border/60 text-foreground placeholder:text-neutral h-8 w-full rounded-md border px-2.5 text-xs shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40';

/** ui-next SelectTrigger styling for dental side panels. */
export const dentalPanelSelectTriggerClassName =
  'border-border/60 bg-background text-foreground h-8 w-full text-xs shadow-none';

export const dentalPanelSectionClassName =
  'border-border/60 bg-muted/10 rounded-lg border';

export const dentalPanelCheckboxClassName =
  'border-border/80 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4 rounded-sm';

/** Readable body text on dark dental surfaces — avoids broken opacity modifiers on theme tokens. */
export const dentalPanelBodyTextClassName = 'text-neutral-light';

/** Secondary/meta copy (counts, hints, select-all). */
export const dentalPanelMetaTextClassName = 'text-neutral';

export const dentalPanelTextActionClassName =
  'text-neutral hover:text-primary disabled:hover:text-neutral h-auto px-0 py-0 text-xs font-medium leading-none disabled:cursor-not-allowed';

export const dentalPanelDestructiveTextActionClassName =
  'text-neutral hover:text-destructive disabled:hover:text-neutral h-auto px-0 py-0 text-xs font-medium leading-none disabled:cursor-not-allowed';

/** ScrollArea wrapper — matches Studies panel / OHIF sidebar scrollbars. */
export const dentalPanelScrollAreaClassName = 'min-h-0 flex-1';
