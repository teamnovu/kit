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
  `eslint -f json -o <file>` or `pnpm audit --json`). Scripts placed in the scratchpad and run with `node <file>`
  work.
- **Searches:** `rg` commands are declined. `packages/shopware-composables/.env` and `.env.test` are not
  gitignored, so content searches touch them. Use `git grep` on tracked paths instead, or `grep` on explicit
  directories.
- **Command size:** long compound commands (several pipes, `rm -rf`, trailing status checks) tend to be
  declined. Keep commands short and focused.
- **Raw `rm -rf`** of build output was declined.

# Pitfall: installing inside the sandbox

A `pnpm install` that runs inside the agent's sandbox cannot write the global store. pnpm then switches to a
repo-local `.pnpm-store`, purges every `node_modules` and fails half-way. This happened on 2026-11-11.

**The trap is pnpm 11's automatic install.** Before `pnpm exec`, `pnpm run` or `pnpm test`, pnpm checks
whether `package.json` matches the installed state, and installs on a mismatch. So any pnpm command the agent
runs after a `package.json` edit triggers a sandboxed install. A later attempt was only saved because pnpm
aborted the purge without a TTY.

**Rules after editing `package.json`:**
- Run no `pnpm` command until the user has installed.
- If you need a tool before that, call the binary directly (`./node_modules/.bin/eslint`, `vitest`, `tsc`),
  which bypasses the check.

Recover from **your own terminal**:

```
rm -rf .pnpm-store node_modules packages/*/node_modules
pnpm install
```

Afterwards, `node_modules/.modules.yaml` must show `storeDir` as `~/Library/pnpm/store/v11` again.

Installs the user runs via `!` work, including ones that download new versions; they use the global store.
An earlier note claiming the opposite was wrong.

# Agreed workarounds (2026-11-11)

- The agent edits `package.json` files. **The user runs `pnpm install` in their own terminal**, not via `!`,
  and reports back.
- Commits are made by the agent, and the user approves each one in the permission prompt.
- Multi-file scripted edits (including `eslint --fix`) need the user's approval of a description first.
- Build output is cleaned only through the root **`pnpm clean`** script, which removes `packages/*/dist`.
- Temporary files go to `$TMPDIR` or the session scratchpad, never into the repo.
- `pnpm lint` autofixes files. For read-only checks, use `pnpm exec eslint .`.
