
# Contribution guide

## Claim your task

Before you start to write any code, please check if the component / functionality you want to implement already exists. If not, follow the following steps:

* Go to [the Tasklist on Notion](https://www.notion.so/jkgroup/shared-bits-48e37099b91240acb11dc487e3101068?pvs=4).
* If the functionality you want to implement is listed, claim it.
* If the functionality is not listed, make a request in the `#circle-frontend` channel to see if interest is there. If there is, it will be added to the Notion-Tasklist. Once added you can claim the task.

## Create the functionality

Implement your functionality while keeping to the [guidelines](./guidelines.md).

## Commits and releases

Releases are automated with [release-please](https://github.com/googleapis/release-please). It derives versions,
changelogs and npm releases from [Conventional Commits](https://www.conventionalcommits.org/), so every commit has
to follow that format:

| Commit | Example | Result |
| --- | --- | --- |
| `fix(<package>): …` | `fix(components): keep focus inside the dialog` | patch release |
| `feat(<package>): …` | `feat(nuxt): support Nuxt 4` | minor release |
| `<type>!: …` with a `BREAKING CHANGE:` footer | `fix(deps)!: update @vueuse/core to 15` | major release (minor below 1.0.0) |
| `chore`, `docs`, `test`, `ci`, `build`, `style`, `refactor` | `chore(deps): update vitest to 5` | no release |

* A commit counts for every package whose files it changes. Keep commits focused on one package or concern.
* Use `fix(deps)` for dependency changes that reach consumers (dependencies, peer dependencies) and `chore(deps)`
  for development tooling.
* Describe in the `BREAKING CHANGE:` footer what consumers have to change. It appears in the changelog and in the
  Slack release notes.
* Never change `version` in a `package.json` or edit a `CHANGELOG.md` by hand.

Releasing happens in two steps:

1. After every merge into `main`, release-please opens or updates a release pull request with the next versions and
   changelog entries.
2. Merging that release pull request tags the packages, creates GitHub releases, publishes the new versions to npm
   and posts the release notes to Slack.

## Create a pull request
Once implemented, create a pull request on GitHub from your branch to `main`. Set `Elias Bernhaut` and `Patrick Stillhart` (TODO: Check reviewer list) as reviewers.
Pull requests are merged with **Rebase and merge** so that every commit reaches release-please; do not squash.
