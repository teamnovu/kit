import path, { join } from 'path'
import { loadConfigFromFile, normalizePath, type ConfigEnv } from 'vite'
import {
  readdir, access, constants, readFile,
} from 'fs/promises'
import type { DefaultTheme, UserConfig } from 'vitepress'
import { glob } from 'glob'

type GetPromiseType<T extends Promise<unknown>> = T extends Promise<
  infer Target
>
  ? Target
  : unknown
type Dirent = GetPromiseType<ReturnType<typeof readdir>>[number]

function capitalize(str: string) {
  return str[0].toUpperCase() + str.slice(1)
}

function getPackagePath(pkgName: string) {
  return join(process.cwd(), 'packages', pkgName)
}

function getPackageDocsPath(pkgName: string) {
  return join(getPackagePath(pkgName), 'docs')
}

function getPackageConfigPath(pkgName: string) {
  return join(getPackageDocsPath(pkgName), 'config.ts')
}

async function fileExists(fileName: string) {
  try {
    await access(fileName, constants.F_OK)
    return true
  } catch {
    return false
  }
}

/**
 * Check if the package has a `docs` directory with a `config.ts` in it.
 */
async function hasConfig(pkgName: string) {
  return fileExists(getPackageConfigPath(pkgName))
}

/**
 * Check if the package has a `docs` directory.
 */
async function hasDocs(pkgName: string) {
  return fileExists(getPackageDocsPath(pkgName))
}

/**
 * Checks if the package is considered to be a valid package.
 *
 * @param file A possible package path
 * @returns True if the package is considered to be a valid package.
 */
function packageFilter(file: Dirent) {
  return file.isDirectory() && file.name !== 'docs'
}

/**
 * Filter a collection with asynchronous filters
 *
 * @param coll The collection to filter
 * @param predicate The predicate to filter with
 * @returns A filtered collection
 */
async function filterAsync<T>(
  coll: T[],
  predicate: Parameters<T[]['filter']>[0],
) {
  const predicateMask = await Promise.all(coll.map(predicate))
  return coll.filter((_, i) => predicateMask[i])
}

/**
 * Collects a list of the names of all packages in this monorepo.
 *
 * @returns A list of names of the packages in this monorepo.
 */
export async function collectPackageNames() {
  const root = join(process.cwd(), 'packages')

  const packageFiles = await readdir(root, { withFileTypes: true })
  const packages = packageFiles.filter(packageFilter).map(file => file.name)

  return packages
}

/**
 * Collects a list of names of packages with docs.
 *
 * @returns A list of names of packages with docs.
 */
export async function collectPackageNamesWithDocs() {
  const pkgNames = await collectPackageNames()
  return filterAsync(pkgNames, hasDocs)
}

/**
 * Collects a list of names of packages with doc configurations.
 *
 * @returns A list of names of packages with doc configurations.
 */
export async function collectPackageNamesWithConfig() {
  const pkgNames = await collectPackageNames()
  return filterAsync(pkgNames, hasConfig)
}

/**
 * Loads a package configuration
 *
 * @param pkgName The name of the package to load the configuration from
 * @returns The configuration
 */
export async function loadPackageConfiguration(
  pkgName: string,
  configEnv: ConfigEnv,
) {
  const result = await loadConfigFromFile(
    configEnv,
    `./packages/${pkgName}/docs/config.ts`,
    normalizePath(process.cwd()),
  )
  return result?.config
}

/**
 * Loads the configurations of all packages in `pkgNames`
 *
 * @param configEnv A configuration environment
 * @param pkgNames The package names
 * @returns An array of all loaded configurations
 */
export async function loadPackageConfigurations(
  configEnv: ConfigEnv,
  pkgNames: string[],
) {
  if (!pkgNames.length) return []
  const configPromises = pkgNames.map(pkgName => loadPackageConfiguration(pkgName, configEnv))
  const configs = await Promise.all(configPromises)
  return (
    (configs.filter(config => config) as UserConfig<DefaultTheme.Config>[])
    ?? []
  )
}

/**
 * Creates an extends chain with the goal to merge latter configurations
 * into former configurations.
 *
 * @param packageConfigs The target configuration with the extends chain.
 * @returns
 */
export async function buildExtendsChain(
  ...configs: UserConfig<DefaultTheme.Config>[]
) {
  return configs.reduce((a, b) => ({
    ...b,
    extends: a,
  }))
}

/**
 * Builds a nested sidebar link entry for the given package.
 * The links are inferred through the file structure.
 *
 * @param pkgName The package name
 * @returns A nested link entry for this package
 */
async function buildSidebarConfigForPackage(pkgName: string) {
  const pkgDocPaths = await glob(`${getPackageDocsPath(pkgName)}/**/*.md`)
  const relativePaths = pkgDocPaths.map(pkgDoc => path
    .relative(getPackageDocsPath(pkgName), pkgDoc)
    .slice(0, -3))

  const sidebarConfig = {
    text: await buildSidebarName(pkgName) as string | undefined,
    items: [] as DefaultTheme.SidebarItem[] | undefined,
  } as DefaultTheme.SidebarItem

  for (const relPath of relativePaths) {
    const isIndex = relPath.toLocaleLowerCase() === 'index'
    const pathParts = isIndex ? [] : relPath.split(path.sep)

    if (isIndex) {
      sidebarConfig.link = path.join('packages', pkgName, relPath)
    }

    let currentItem: DefaultTheme.SidebarItem = sidebarConfig
    for (const pathPartIndex in pathParts) {
      const isLast = parseInt(pathPartIndex) === pathParts.length - 1
      const pathPart = pathParts[pathPartIndex]
      const name = await buildSidebarName(pathPart)
      const existingItem = currentItem.items?.find(({ text }) => text === name)

      if (existingItem) {
        currentItem = existingItem
      } else {
        const newItem: DefaultTheme.SidebarItem = {
          items: [],
          text: await buildSidebarName(pathPart),
          link: isLast ? path.join('packages', pkgName, relPath) : undefined,
        }
        currentItem.items?.push(newItem)
        currentItem = newItem
      }
    }
  }

  return sidebarConfig
}

/**
 * Creates a printable form of the given string
 *
 * @param name The plain string to convert into a proper display name
 * @returns The name in a printable format
 */
async function buildSidebarName(name: string) {
  try {
    const info = await readFile(`${getPackageDocsPath(name)}/info.json`)
    return JSON.parse(info.toString()).name
  } catch {
    return capitalize(
      name.replace(/(\w)[^\w_](\w)/, (_, m1, m2) => `${m1} ${m2.toUpperCase()}`),
    )
  }
}

/**
 * Creates sidebar links for all packages. Inferred by path.
 *
 * @returns Vitepress sidebar links for all packages
 */
export async function buildPackageLinks() {
  const pkgNames = await collectPackageNamesWithDocs()
  return await Promise.all(pkgNames.map(buildSidebarConfigForPackage))
}
