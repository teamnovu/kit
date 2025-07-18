import novu from '@teamnovu/eslint-config-vue'
import tseslint from 'typescript-eslint'
import { includeIgnoreFile } from '@eslint/compat'
import { fileURLToPath } from 'node:url'

export default tseslint.config(
  includeIgnoreFile(fileURLToPath(new URL('.gitignore', import.meta.url))),
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
)
