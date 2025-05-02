import js from '@eslint/js'
import pluginStylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginStylistic.configs['recommended'],
  {
    rules: {
      // stylistic
      // ********************
      '@stylistic/newline-per-chained-call': [
        'error',
        { ignoreChainWithDepth: 2 },
      ],
      '@stylistic/nonblock-statement-body-position': 'error',
      '@stylistic/one-var-declaration-per-line': 'error',
      '@stylistic/operator-linebreak': [
        'error',
        'before',
        { overrides: { '=': 'none' } },
      ],
      '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/no-mixed-operators': ['error', { allowSamePrecedence: true }],
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/array-bracket-newline': ['error', { multiline: true }],
      '@stylistic/array-element-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
        },
      ],
      '@stylistic/max-len': [
        'warn',
        {
          code: 150,
          tabWidth: 2,
        },
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          multiline: true,
          consistent: true,
        },
      ],
      '@stylistic/object-property-newline': [
        'error',
        { allowAllPropertiesOnSameLine: false },
      ],

      // common
      // ********************
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'prefer-destructuring': [
        'error',
        {
          array: false,
          object: true,
        },
      ],
      'no-unused-vars': 'off',
      'eqeqeq': ['error', 'smart'],
      'no-undef': 'off', // done by typescript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
)
