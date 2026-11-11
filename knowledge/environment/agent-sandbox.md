---
type: Playbook
title: Agent sandbox
description: What Claude Code sessions can and cannot do in this repo, and the agreed workarounds.
tags: [claude-code, sandbox, pnpm, workflow]
---

# Restrictions

- **pnpm store:** writes to `~/Library/pnpm/store/v11` are blocked. A frozen `pnpm install` works, but any
  install that adds packages doesn't. Inside the sandbox pnpm falls back to a repo-local `.pnpm-store`, which
  must not be used.
- **Private files:** `~/.npmrc`, `.env*`, SSH keys and GitHub CLI config are unreadable. Private GitHub repos
  (e.g. `teamnovu/novu-skills`, SSH only) cannot be fetched from the sandbox.
- **Inline scripts:** `node -e` snippets are not approved. For JSON analysis, use `jq` (e.g. on
  `eslint -f json` or `pnpm audit --json`).
- **Raw `rm -rf`** of build output was declined.

# Agreed workarounds (2026-11-11)

- The agent edits `package.json` files; **the user runs `pnpm install`** and reports back.
- Build output is cleaned only through the root **`pnpm clean`** script, which removes `packages/*/dist`.
- Temporary files go to `$TMPDIR` or the session scratchpad, never into the repo.
- `pnpm lint` autofixes files. For read-only checks, use `pnpm exec eslint .`.
