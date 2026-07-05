import { Types } from '@ohif/core';

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
      attribute: 'Modality',
      weight: 25,
      constraint: { contains: { value: 'DX' } },
    },
    {
      attribute: 'isDisplaySetFromUrl',
      weight: 20,
      constraint: { equals: true },
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
      attribute: 'Modality',
      weight: 25,
      constraint: { contains: { value: 'DX' } },
    },
  ],
};

const bitewingSelector = {
  studyMatchingRules: currentStudySelector.studyMatchingRules,
  seriesMatchingRules: [
    {
      attribute: 'SeriesDescription',
      weight: 30,
      constraint: { contains: { value: 'bitewing' } },
    },
    {
      attribute: 'numImageFrames',
      constraint: { greaterThan: { value: 0 } },
    },
  ],
};

const currentDisplaySet = { id: 'currentDisplaySetId' };
const priorDisplaySet = { id: 'priorDisplaySetId' };
const bitewingLeftDisplaySet = { id: 'bitewingLeftDisplaySetId' };
const bitewingRightDisplaySet = { id: 'bitewingRightDisplaySetId' };

const baseViewport = {
  viewportOptions: {
    toolGroupId: 'default',
    allowUnmatchedView: true,
    viewportLabel: '',
  },
};

const hpDental2x2: Types.HangingProtocol.Protocol = {
  id: '@ohif/hpDental2x2',
  name: 'Dental 2x2',
  description: 'Current image, prior exam, and bitewing placeholders',
  numberOfPriorsReferenced: 1,
  protocolMatchingRules: [],
  toolGroupIds: ['default'],
  displaySetSelectors: {
    currentDisplaySetId: currentStudySelector,
    priorDisplaySetId: priorStudySelector,
    bitewingLeftDisplaySetId: bitewingSelector,
    bitewingRightDisplaySetId: bitewingSelector,
  },
  defaultViewport: {
    viewportOptions: {
      viewportType: 'stack',
      toolGroupId: 'default',
      allowUnmatchedView: true,
    },
    displaySets: [{ id: 'currentDisplaySetId', matchedDisplaySetsIndex: -1 }],
  },
  stages: [
    {
      name: 'Dental 2x2',
      stageActivation: { enabled: { minViewportsMatched: 1 } },
      viewportStructure: {
        layoutType: 'grid',
        properties: { rows: 2, columns: 2 },
      },
      viewports: [
        {
          ...baseViewport,
          viewportOptions: {
            ...baseViewport.viewportOptions,
            viewportLabel: 'Current',
          },
          displaySets: [currentDisplaySet],
        },
        {
          ...baseViewport,
          viewportOptions: {
            ...baseViewport.viewportOptions,
            viewportLabel: 'Prior Exam',
          },
          displaySets: [priorDisplaySet],
        },
        {
          ...baseViewport,
          viewportOptions: {
            ...baseViewport.viewportOptions,
            viewportLabel: 'Bitewing Left',
          },
          displaySets: [
            {
              ...bitewingLeftDisplaySet,
              matchedDisplaySetsIndex: 0,
            },
          ],
        },
        {
          ...baseViewport,
          viewportOptions: {
            ...baseViewport.viewportOptions,
            viewportLabel: 'Bitewing Right',
          },
          displaySets: [
            {
              ...bitewingRightDisplaySet,
              matchedDisplaySetsIndex: 1,
            },
          ],
        },
      ],
    },
  ],
};

export default hpDental2x2;
