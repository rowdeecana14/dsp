/** Public API for the viewer module. */
export { default as DentalViewportPlaceholders } from './components/DentalViewportPlaceholders';
export { useDentalViewportContext } from './hooks/useDentalViewportContext';
export { useDentalViewerStateRestore } from './hooks/useDentalViewerStateRestore';
export { useViewerState } from './hooks/useViewerState';
export { useViewerStore } from './store/viewer.store';
export * from './services/viewerStateApi';
export * from './services/dentalViewerStateSync';
export { viewerStatePayloadSchema } from './schemas/viewer.schema';
