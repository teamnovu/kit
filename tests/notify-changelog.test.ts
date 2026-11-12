import { describe, expect, it } from 'vitest'
import { buildReleaseMessages, MARKDOWN_LIMIT } from '../scripts/notify-changelog.js'

const packageNames: Record<string, string> = {
  'packages/components': '@teamnovu/kit-components',
  'packages/operations': '@teamnovu/kit-operations',
}

const readPackageName = (path: string) => packageNames[path]

const componentsBody = [
  '## [2.0.0](https://github.com/teamnovu/kit/compare/kit-components-v1.2.3...kit-components-v2.0.0) (2026-11-12)',
  '',
  '### ⚠ BREAKING CHANGES',
  '',
  '* **deps:** @teamnovu/kit-components requires vue >= 3.5',
  '',
  '### Bug Fixes',
  '',
  '* **components:** point exports, main and module at the emitted .js files ([cd0d859](https://github.com/teamnovu/kit/commit/cd0d859))',
].join('\n')

describe('buildReleaseMessages', () => {
  it('builds one message per released package with the release notes verbatim', () => {
    const outputs = {
      'releases_created': 'true',
      'paths_released': '["packages/components","packages/operations"]',
      'packages/components--version': '2.0.0',
      'packages/components--html_url': 'https://github.com/teamnovu/kit/releases/tag/kit-components-v2.0.0',
      'packages/components--body': componentsBody,
      'packages/operations--version': '0.0.7',
      'packages/operations--html_url': 'https://github.com/teamnovu/kit/releases/tag/kit-operations-v0.0.7',
      'packages/operations--body': '### Bug Fixes\n\n* **operations:** unwrap getter query keys in createEndpoints',
    }

    const messages = buildReleaseMessages(outputs, readPackageName)

    expect(messages).toHaveLength(2)
    expect(messages[0].blocks[1].text).toBe(componentsBody)
    expect(messages).toMatchSnapshot()
  })

  it('cuts release notes above the Slack markdown limit and links the full release', () => {
    const releaseUrl = 'https://github.com/teamnovu/kit/releases/tag/kit-operations-v0.0.7'
    const outputs = {
      'paths_released': '["packages/operations"]',
      'packages/operations--version': '0.0.7',
      'packages/operations--html_url': releaseUrl,
      'packages/operations--body': '* change\n'.repeat(2_000),
    }

    const [message] = buildReleaseMessages(outputs, readPackageName)
    const markdown = message.blocks[1].text

    expect(markdown).toHaveLength(MARKDOWN_LIMIT)
    expect(markdown.endsWith(`[Full release notes](${releaseUrl})`)).toBe(true)
  })

  it('builds no messages when nothing was released', () => {
    expect(buildReleaseMessages({
      releases_created: 'false',
      paths_released: '[]',
    }, readPackageName)).toEqual([])
  })
})
