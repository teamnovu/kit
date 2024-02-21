---
outline: deep
---

# Contribution Guidelines

## Project structure

| Directory | Purpose |
| ---- |  -----  |
| .vitepress | Contains the configuration for the documentation website (Vitepress) |
| docs | General documentation pages |
| packages | The root-folder for all packages |
| scripts | Contains helper-scripts for development, deployment etc. |

## Working on a package

Packages are all listed under `packages/<package-name>`. They are managed by [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true) and thus every package must be listed in `package.json` under the key `"workspaces"`.

Be aware that the order of the package listing defines the order in which workspace commands (`npm run -ws <command>`) are executed.

### Package configuration

The `package.json` in each package must define a `main` and a `module` entry.
In case you want to define additional direct exports you may add them to the `exports` listing in the `package.json`

::: info
For the specific packages `@teamnovu/kit-components` and `@teamnovu/kit-composables` it is adviced to add every component / composable to the `exports` listing.
:::

### Adding a dependency to a package

You can add a dependency to your package by using `npm i -w @teamnovu/kit-<package> <dependency name>` or if you are adding a dependency on another package in the repo you can use `npm i -w @teamnovu/kit-<target name> @teamnovu/kit-<dependency name>`.

### How to plan a new functionality

First and foremost it is important that we keep structure and styling out of these packages as much as possible. Styling even more so than structure.
To figure out the best way to implement a new funcitonality follow the guide below:

* If possible, implement the functionality as a composable(s).
* Wrap the composable(s) with (a) headless component(s) if the functionality is one concerning the DOM or if functionality is passed down the component tree through [provide/inject](https://vuejs.org/guide/components/provide-inject.html).
* Whenever possible do not use HTML elements. Only use [slots](https://vuejs.org/guide/components/slots.html).
* When creating accessible components you do need HTML elements. In this case never create more than one DOM element per component. Plan the accessibility-attributes carefully.
* Prefix headless components with a `H`. Add a <Badge type="tip" text="Headless variant available" /> badge or similar to the documentation header if applicable.
* While in development and not yet ready for general use, add a <Badge type="danger" text="Experimental" /> to the documentation header for the component. 

Refer to [Collapse](./packages/components/collapse.md) and [Accordion](./packages/components/accordion.md) for possible structuring.

### Development cycle

Each package has its own `package.json` file with its own dependencies and scripts.

You can run a command in all workspaces with `npm run <script> -ws` or if you only want to run it in the workspaces that define the specific script you can use `npm run <script> -ws --if-present`. To run any npm command within a single package you can use the modifiers `-w <package>` e.g. by name: `-w @teamnovu/kit-components` or by path: `-w packages/components`.

Since `npm workspaces` does currently not allow for the execution of scripts in parallel but there is a script in `<root>/scripts/runAll.ts` for allowing just that. You can use it by running for example `npx esno ./scripts/runAll.ts watch`. This specific script is also available as simple `npm run watch`.

**Process:**

* ```git checkout -b <feature/xyz>```

* ```npm run watch```

* Write your code

* Document your code within the code if necessary and crucially in `docs/*`. View your documentation-changes through `npm run docs:watch`.

* Control the need for additional `exports` declarations in `package.json`.

* TODO: Changelogs?

* ```git push -u origin <feature/xyz>```

* Create merge request from `feature/xyz` to `master`


## Create a new package

```
npm init -w packages/<packageName>
```

**Checklist:**

* For the name use `@teamnovu/kit-<packageName>`.

* Create a `main`, `types` and a `module` entry and point them to `dist/index.mjs` (vite) or `dis/index.js` (typescript-only). Point the `types` to `dist/index.d.ts`.

* Create the `exports` key and add
  ```json
  "exports": {
    ".": "./dist/index.js" // .mjs for vite
  }
  ```
  
* Add the `scripts`:

  For typescript only:
  ```json
  "scripts": {
    "build": "tsc --declaration",
    "watch": "tsc --declaration --watch"
  },
  ```

  For vite:
  ```json
  "scripts": {
    "build": "vite build",
    "watch": "vite watch"
  },
  ```
  
* If you are using `vite` in the project, please also add `vue` as `peerDependency`:
  ```json
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  ```
  
* Add the base typescript-config as dependency: `npm run -w @teamnovu/kit-<package name> @teamnovu/kit-tsconfig`
  
* Add the following `tsconfig.json` in the root of the project:
  ```json
  {
    // We extend it from here!
    "extends": "@teamnovu/kit-tsconfig/base.json",
    "compilerOptions": {
      "outDir": "dist",
    },
    "include": ["src/**/*"]
  }
  ```
  
* If you want to create a documentation section for your new package, add the folder `docs`.


## Documentation

Run the development mode for the documentation with `npm run docs:watch`.

You can edit the general documentation under `docs/**/*.md`. The url structure follows the folder structure.
In case you want to edit the sidebar entries you will have to configure it in `.vitepress/config.ts`.

Package-specific documentation goes into the `docs` folder of each package. They are merged with the general documentation and their links are automatically created according to the folder structure. Vitepress is configured such that package specific documentation will get the path `packages/<package name>/**/*.html`.

::: warning Attention
If you create internal links across packages you will have to use the final link - not the link according to your folder structure.
:::

