---
type: Reference
title: Slack release notifications
description: How release notes are posted to Slack, why they used to show as raw Markdown, and the planned replacement.
resource: https://docs.slack.dev/reference/block-kit/blocks/markdown-block
tags: [slack, release, ci]
---

# Today (`scripts/notify-changelog.js`)

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

**Still to verify:** one real post to a scratch channel, to confirm that incoming webhooks render the
`markdown` block. If not, switch to the link-only fallback.

# Design

- **No parsing:** the script reads the release-please action outputs (`RELEASE_PLEASE_OUTPUTS` =
  `toJSON(steps.release.outputs)`). For each path in `paths_released`, it takes `--version`, `--html_url` and
  `--body`.
- **Rendering:** one webhook POST per released package, with a `header` block plus a Slack **`markdown`
  block** carrying the body verbatim. That block renders standard Markdown: headings, bold, links, lists.
- **Limit:** the markdown block's cumulative limit is 12,000 characters per payload. Longer text is cut and
  the release link appended.
- **Unverified:** whether incoming webhooks accept the `markdown` block. If they don't, fall back to a
  link-only message.
- **Ordering:** the step runs only after a successful publish, so Slack never announces a version that isn't
  on npm.
