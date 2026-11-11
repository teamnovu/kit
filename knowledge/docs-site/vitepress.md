---
type: Reference
title: VitePress docs site
description: How the kit.novu.ch documentation site is assembled from root and package docs and deployed.
resource: https://kit.novu.ch/
tags: [docs, vitepress, github-pages]
---

# Facts

- **Version:** VitePress 1.6.x (`pnpm docs:dev` on port 3005, `docs:build`, `docs:preview`). VitePress 1.x
  bundles its **own vite 5**, independent of the root vite used for package builds. VitePress 2 is still
  alpha (2.0.0-alpha.21 on vite 8) as of 2026-11-11.
- **Source dir:** the repo root, so **every `.md` file in the repo becomes a page** unless excluded via
  `srcExclude`. The root `README.md` ends up on the site. This `knowledge/` bundle is excluded.
- **Rewrites:** `docs/(.*)` → `(.*)` and `packages/:pkg/docs/(.*)` → `packages/:pkg/(.*)`.
- **Package configs:** a `packages/<pkg>/docs/config.ts` is loaded with vite's `loadConfigFromFile` (imported
  from the **root** vite in `.vitepress/utils.ts`) and merged into the site config via `buildExtendsChain`.
  `glob` (root devDep) is used there as well.
- **Search:** the root `vite.config.js` adds `vitepress-plugin-search` (1.0.4-alpha, peers VitePress ^1).
- **Deployment:** GitHub Pages on every push to `main`, from `.vitepress/dist`.
- **Baseline:** the docs build is green as of 2026-11-11.
