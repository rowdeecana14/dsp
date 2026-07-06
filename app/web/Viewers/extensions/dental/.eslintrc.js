module.exports = {
  root: true,
  extends: ['../../../.eslintrc.json'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: [
              '**/modules/*/**',
              '!**/modules/*/index',
              '!**/modules/*/index.ts',
            ],
            message:
              'Import from module public API only (modules/<name>/index.ts).',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: [
        '**/modules/**/hooks/**',
        '**/modules/**/services/**',
        '**/modules/**/store/**',
        '**/modules/**/schemas/**',
        '**/modules/**/types/**',
        '**/app/**',
        '**/shared/**',
      ],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['**/modules/**/components/**'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['**/modules/*/services/**'],
                message: 'Components must not import services directly — use hooks.',
              },
            ],
          },
        ],
      },
    },
  ],
};
