import { execSync } from 'node:child_process'

const { SLACK_WEBHOOK_URL } = process.env

if (!SLACK_WEBHOOK_URL) {
  console.log('SLACK_WEBHOOK_URL not set, skipping notification')
  process.exit(0)
}

const changedFiles = execSync('git diff --name-only HEAD~1 HEAD -- "packages/**/CHANGELOG.md"', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean)

if (changedFiles.length === 0) {
  console.log('No changelog files changed')
  process.exit(0)
}

const changes = []

for (const file of changedFiles) {
  const packageName = file.split('/')[1] // packages/[name]/CHANGELOG.md

  const diff = execSync(`git diff HEAD~1 HEAD -- "${file}"`, { encoding: 'utf-8' })
  const lines = diff
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1)) // Remove the '+' prefix

  // Find first version entry and skip everything before
  const firstVersionIndex = lines.findIndex(line => line.startsWith('## ['))
  const contentLines = firstVersionIndex >= 0 ? lines.slice(firstVersionIndex) : lines

  const addedLines = contentLines.join('\n').trim()

  if (addedLines) {
    changes.push({
      packageName,
      addedLines,
    })
  }
}

if (changes.length === 0) {
  console.log('No new changelog entries found')
  process.exit(0)
}

const message = changes
  .map(({ packageName, addedLines }) => `📦 \`@teamnovu/kit-${packageName}\`\n\`\`\`\n${addedLines}\n\`\`\``)
  .join('\n\n')

const payload = {
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📝 Changelog updated',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
      },
    },
  ],
}

const response = await fetch(SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  console.error('Failed to send Slack notification:', response.statusText)
  process.exit(1)
}

console.log('Slack notification sent successfully')
