/** @type {AppTypes.Config} */

window.config = {
  name: 'config/dental.js',
  routerBasename: null,
  extensions: [],
  modes: [],
  customizationService: [
    '@ohif/extension-dental.customizationModule.dental',
    '@ohif/extension-dental.customizationModule.dentalAuth',
    '@ohif/extension-default.customizationModule.theme',
  ],
  showStudyList: true,
  maxNumberOfWebWorkers: 3,
  showWarningMessageForCrossOrigin: true,
  showCPUFallbackMessage: true,
  showLoadingIndicator: true,
  groupEnabledModesFirst: true,
  defaultDataSourceName: 'ohif',
  dentalPracticeName: 'Bright Smile Dental',
  dentalApiUrl: 'http://localhost:3000/api/v1',
  showPatientInfo: 'visible',
  investigationalUseDialog: {
    option: 'never',
  },
  dataSources: [
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'ohif',
      configuration: {
        friendlyName: 'AWS S3 Static wado server',
        name: 'aws',
        wadoUriRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        wadoRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'thumbnail',
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: true,
        supportsWildcard: true,
        staticWado: true,
        singlepart: 'bulkdata,video',
        bulkDataURI: {
          enabled: true,
          relativeResolution: 'studies',
        },
        omitQuotationForMultipartRequest: true,
      },
    },
    {
      namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
      sourceName: 'local5000',
      configuration: {
        friendlyName: 'Static WADO Local Data',
        name: 'DCM4CHEE',
        qidoRoot: 'http://localhost:5000/dicomweb',
        wadoRoot: 'http://localhost:5000/dicomweb',
        qidoSupportsIncludeField: false,
        imageRendering: 'wadors',
        thumbnailRendering: 'wadors',
        enableStudyLazyLoad: true,
        staticWado: true,
      },
    },
  ],
  httpErrorHandler: error => {
    console.warn('HTTP Error', error.status);
  },
  modesConfiguration: {
    '@ohif/mode-dental': {
      hide: { $set: false },
      isValidMode: {
        $set: () => ({ valid: true, description: 'Dental mode available for all studies' }),
      },
    },
    '@ohif/mode-longitudinal': {
      hide: { $set: true },
    },
    '@ohif/mode-basic': {
      hide: { $set: true },
    },
  },
};
