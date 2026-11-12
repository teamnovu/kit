# @teamnovu/kit-*
look no further. We have all you will ever need.

Just kidding.

This is a collection of useful components, composables and other internal libraries that we want to share throughout projects.
Its far from complete and new functionalities are incoming when the need arises.

For a list of possible future contributions, take a look at the [Notion page](https://www.notion.so/jkgroup/shared-bits-48e37099b91240acb11dc487e3101068?pvs=4.).


```
pnpm run docs:build
pnpm run docs:preview
```

## Releasing

Releases are automated with [release-please](https://github.com/googleapis/release-please). For details, see the
[contribution guide](docs/contribute.md#commits-and-releases).

1. **Commits:** write [Conventional Commits](https://www.conventionalcommits.org/), scoped to the package:

   | Commit | Release |
   | --- | --- |
   | `fix(components): …` | patch |
   | `feat(nuxt): …` | minor |
   | `fix(deps)!: …` with a `BREAKING CHANGE:` footer | major |
   | `chore`, `docs`, `test`, `ci`, `build` | none |

2. **Versions:** never edit `version` fields or `CHANGELOG.md` files.
3. **Merging:** open a PR to `main`. Once the **Verify** check passes, merge it with **Rebase and merge**. Squashing
   would hide the individual commits from release-please.
4. **Release:** release-please then opens or updates a release PR. Merging it publishes to npm, creates the
   GitHub releases and posts the release notes to Slack.

**Pipeline setup** (`.github/workflows/release.yml`):
- the `NPM_TOKEN` and `SLACK_WEBHOOK_URL` secrets
- "Allow GitHub Actions to create and approve pull requests" in the repository's Actions settings
