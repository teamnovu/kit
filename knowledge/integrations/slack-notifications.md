---
type: Reference
title: Slack release notifications
description: How release notes are posted to Slack, why they used to show as raw Markdown, and how they render now.
resource: https://docs.slack.dev/reference/block-kit/blocks/markdown-block
tags: [slack, release, ci]
---

# Before (until `13b9767`)

- **When:** runs in CI after a version change, with the `SLACK_WEBHOOK_URL` secret; it skips if the secret is
  unset.
- **What it does:**
  - finds the previous `release-*` git tag
  - diffs `packages/**/CHANGELOG.md` against it
  - keeps the added lines from the first `## [` heading on
  - posts them wrapped in a ```` ``` ```` code block inside a `mrkdwn` section
- **Why the code block:** Slack's `mrkdwn` is not standard Markdown and can't render `##` headings,
  `**bold**` or `[text](url)` links. Wrapping in a code block kept it legible but showed raw Markdown.
- **Weakness:** the custom diff parsing is fragile.

# Current (since commit `13b9767`, wired in `4453da1`)

`scripts/notify-changelog.js` exports `buildReleaseMessages(outputs, readPackageName)`, covered by
`tests/notify-changelog.test.ts` with a snapshot. To preview locally:

```
RELEASE_PLEASE_OUTPUTS='<json>' node scripts/notify-changelog.js
```

Without `SLACK_WEBHOOK_URL`, the script prints the payloads instead of sending them.

**Verified 2026-11-12:** a test post through an incoming webhook to a scratch channel rendered the
`markdown` block. Headings appear as bold text; bold scopes, lists, quotes and commit links render. Links
inside headings show as plain text, so the compare link in release-please's version heading isn't
clickable.

# Design

- **No parsing:** the script reads the release-please action outputs (`RELEASE_PLEASE_OUTPUTS` =
  `toJSON(steps.release.outputs)`). For each path in `paths_released`, it takes `--version`, `--html_url` and
  `--body`.
- **Rendering:** one webhook POST per released package, with a `header` block plus a Slack **`markdown`
  block** carrying the body verbatim. That block renders standard Markdown: headings, bold, links, lists.
- **Limit:** the markdown block's cumulative limit is 12,000 characters per payload. Longer text is cut and
  the release link appended.
- **Ordering:** the step runs only after a successful publish, so Slack never announces a version that isn't
  on npm.
