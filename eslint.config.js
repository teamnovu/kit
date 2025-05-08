import novu from '@teamnovu/eslint-config-vue'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config(
  globalIgnores(['*.sh', '*.md', '*.woff', '*.ttf', '.vscode', '.idea', '.husky', '.local', 'node_modules', '!/.vitepress']),
  tseslint.configs.recommended,
  novu,
)
