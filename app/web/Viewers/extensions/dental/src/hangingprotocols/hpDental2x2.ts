import { Types } from '@ohif/core';

const viewportOptions = {
  viewportType: 'stack',
  toolGroupId: 'default',
  allowUnmatchedView: true,
};

const currentStudySelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: { equals: { value: 0 } },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: { greaterThan: { value: 0 } },
    },
    {
      attribute: 'isBitewingSeries',
      constraint: { equals: { value: false } },
      weight: 10,
    },
  ],
};

const priorStudySelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: { equals: { value: 1 } },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: { greaterThan: { value: 0 } },
    },
    {
      attribute: 'isBitewingSeries',
      constraint: { equals: { value: false } },
      weight: 10,
    },
    {
      attribute: 'sameModalityAsCurrent',
      constraint: { equals: { value: true } },
      required: true,
      weight: 30,
    },
  ],
};

const bitewingLeftSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: { equals: { value: 0 } },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'isBitewingSeries',
      constraint: { equals: { value: true } },
      required: true,
    },
    {
      attribute: 'bitewingSide',
      constraint: { equals: { value: 'left' } },
      weight: 20,
    },
  ],
};

const bitewingRightSelector = {
  studyMatchingRules: [
    {
      attribute: 'studyInstanceUIDsIndex',
      from: 'options',
      required: true,
      constraint: { equals: { value: 0 } },
    },
  ],
  seriesMatchingRules: [
    {
      attribute: 'isBitewingSeries',
      constraint: { equals: { value: true } },
      required: true,
    },
    {
      attribute: 'bitewingSide',
      constraint: { equals: { value: 'right' } },
      weight: 20,
    },
  ],
};

const hpDental2x2: Types.HangingProtocol.Protocol = {
  id: '@ohif/hpDental2x2',
  name: 'Dental 2x2',
  description: 'Current image, prior exam, and bitewing placeholders',
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [
    {
      attribute: 'numImageFrames',
      constraint: { greaterThan: { value: 0 } },
      weight: 100,
    },
  ],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    currentDisplaySetId: currentStudySelector,
    priorDisplaySetId: priorStudySelector,
    bitewingLeftDisplaySetId: bitewingLeftSelector,
    bitewingRightDisplaySetId: bitewingRightSelector,
  },
  defaultViewport: {
    viewportOptions,
    displaySets: [{ id: 'currentDisplaySetId', matchedDisplaySetsIndex: -1 }],
  },
  stages: [
    {
      id: 'dental-2x2',
      name: 'Dental 2x2',
      stageActivation: {
        enabled: { minViewportsMatched: 1 },
      },
      viewportStructure: {
        layoutType: 'grid',
        properties: { rows: 2, columns: 2 },
      },
      viewports: [
        {
          viewportOptions: {
            ...viewportOptions,
            viewportId: 'dental-current',
            customViewportProps: { dentalRole: 'current' },
          },
          displaySets: [{ id: 'currentDisplaySetId' }],
        },
        {
          viewportOptions: {
            ...viewportOptions,
            viewportId: 'dental-prior',
            customViewportProps: { dentalRole: 'prior' },
          },
          displaySets: [{ id: 'priorDisplaySetId', matchedDisplaySetsIndex: 0 }],
        },
        {
          viewportOptions: {
            ...viewportOptions,
            viewportId: 'dental-bw-left',
            customViewportProps: { dentalRole: 'bitewing-left' },
          },
          displaySets: [{ id: 'bitewingLeftDisplaySetId' }],
        },
        {
          viewportOptions: {
            ...viewportOptions,
            viewportId: 'dental-bw-right',
            customViewportProps: { dentalRole: 'bitewing-right' },
          },
          displaySets: [{ id: 'bitewingRightDisplaySetId' }],
        },
      ],
    },
  ],
};

export default hpDental2x2;
