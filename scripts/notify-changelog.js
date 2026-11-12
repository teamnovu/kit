import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

// Slack's cumulative limit for markdown blocks in one payload
export const MARKDOWN_LIMIT = 12_000

function fitToLimit(body, releaseUrl) {
  if (body.length <= MARKDOWN_LIMIT) {
    return body
  }

  const suffix = `\n\n… [Full release notes](${releaseUrl})`
  return body.slice(0, MARKDOWN_LIMIT - suffix.length) + suffix
}

/**
 * Builds one Slack message per package released by release-please.
 *
 * @param {Record<string, string>} outputs The release-please action outputs
 * @param {(path: string) => string} readPackageName Resolves a package path to its npm name
 */
export function buildReleaseMessages(outputs, readPackageName) {
  const paths = JSON.parse(outputs.paths_released ?? '[]')

  return paths.map((path) => {
    const name = readPackageName(path)
    const version = outputs[`${path}--version`]
    const releaseUrl = outputs[`${path}--html_url`]
    const body = outputs[`${path}--body`] ?? ''

    return {
      text: `${name} ${version} released`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📦 ${name} ${version}`,
            emoji: true,
          },
        },
        {
          type: 'markdown',
          text: fitToLimit(body, releaseUrl),
        },
      ],
    }
  })
}

function readPackageName(path) {
  return JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')).name
}

async function main() {
  const outputs = JSON.parse(process.env.RELEASE_PLEASE_OUTPUTS ?? '{}')
  const messages = buildReleaseMessages(outputs, readPackageName)

  if (messages.length === 0) {
    console.log('No releases created')
    return
  }

  const { SLACK_WEBHOOK_URL } = process.env

  if (!SLACK_WEBHOOK_URL) {
    console.log(JSON.stringify(messages, null, 2))
    return
  }

  for (const message of messages) {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      console.error(`Failed to send Slack notification for "${message.text}": ${response.status} ${response.statusText}`)
      process.exitCode = 1
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main()
}
