import novu from '@teamnovu/eslint-config-vue'
import tseslint from 'typescript-eslint'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

export default tseslint.config(
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
  { ignores: ['packages/shopware-composables/api-types/**'] },
  {
    extends: [tseslint.configs.recommended],
    languageOptions: {
      sourceType: 'module',
      parserOptions: { parser: tseslint.parser },
    },
  },
  ...novu,
  {
    rules:
      {
        '@stylistic/max-len': [
          'warn',
          {
            code: 180,
            tabWidth: 2,
          },
        ],
        '@typescript-eslint/no-empty-object-type': 'off',
      },
  },
  {
    rules: {
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/enforces-negative-arbitrary-values': 'off',
      'tailwindcss/enforces-shorthand': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/no-arbitrary-value': 'off',
      'tailwindcss/no-contradicting-classname': 'off',
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.mts', '**/*.vue'],
    rules: { 'no-redeclare': 'off' },
  },
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
)
