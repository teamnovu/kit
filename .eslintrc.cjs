module.exports = {

  root: true,
  ignorePatterns: ['dist/', 'node_modules/', '*.json', '.temp/'],

  settings: {
    'import/resolver': {
      typescript: {},
      alias: {
        map: [
          ['@', './src'],
          ['@images', './src/assets/images'],
        ],
      },
    },
  },

  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },

  extends: ['eslint-config-airbnb-base'],
  rules: {
    'func-names': 'off',
    'no-console': 'warn',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-unreachable': 'warn',
    'no-unused-vars': 'warn',
    'import/extensions': [
      'warn', { ts: 'never' },
    ],
    'import/no-extraneous-dependencies': [
      'warn', { devDependencies: true },
    ],
  },

  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],

  env: {
    browser: true,
  },
};
