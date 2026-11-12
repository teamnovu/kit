import { execFileSync } from 'node:child_process'
import {
  existsSync, readdirSync, readFileSync,
} from 'node:fs'
import { join, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

type ExportTarget = string | { [condition: string]: ExportTarget }

interface PackageJson {
  name: string
  main?: string
  module?: string
  types?: string
  exports?: Record<string, ExportTarget>
}

interface WorkspacePackage {
  dir: string
  pkg: PackageJson
}

const packagesDir = fileURLToPath(new URL('../packages', import.meta.url))

const packages: WorkspacePackage[] = readdirSync(packagesDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(packagesDir, entry.name, 'package.json')))
  .map((entry) => {
    const dir = join(packagesDir, entry.name)
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as PackageJson
    return {
      dir,
      pkg,
    }
  })

function collectStrings(value: ExportTarget | undefined, into: string[]) {
  if (typeof value === 'string') {
    into.push(value)
    return
  }
  Object.values(value ?? {}).forEach(nested => collectStrings(nested, into))
}

function entryTargets(pkg: PackageJson) {
  const targets = [pkg.main, pkg.module, pkg.types].filter((target): target is string => !!target)
  Object.values(pkg.exports ?? {}).forEach(value => collectStrings(value, targets))
  return [...new Set(targets)].sort()
}

function runtimeSubpaths(pkg: PackageJson) {
  return Object.entries(pkg.exports ?? {})
    .filter(([, value]) => {
      const target = typeof value === 'string' ? value : value.import
      return typeof target === 'string' && /\.m?js$/.test(target)
    })
    .map(([subpath]) => subpath)
}

function importInNode(dir: string, specifier: string): string[] {
  const code = [
    `const m = await import(${JSON.stringify(specifier)})`,
    'const describe = key => typeof m[key] === \'function\' ? `${key}: function ${m[key].name}` : `${key}: ${typeof m[key]}`',
    'process.stdout.write(JSON.stringify(Object.keys(m).sort().map(describe)))',
  ].join('\n')
  const output = execFileSync(process.execPath, ['--input-type=module', '--eval', code], {
    cwd: dir,
    encoding: 'utf8',
  })
  return JSON.parse(output)
}

function declarationFiles(dir: string) {
  const dist = join(dir, 'dist')
  return readdirSync(dist, {
    recursive: true,
    encoding: 'utf8',
  })
    .filter(file => file.endsWith('.d.ts'))
    .map(file => file.split('\\').join('/'))
    .sort()
}

describe.each(packages.map(entry => [entry.pkg.name, entry] as const))('%s', (_name, { dir, pkg }) => {
  const built = existsSync(join(dir, 'dist'))

  it('points main, module, types and every export at an existing file', () => {
    const missing = entryTargets(pkg).filter(target => !existsSync(join(dir, target)))
    expect(missing).toEqual([])
  })

  it.skipIf(!built)('exposes the same runtime exports when imported by plain Node', () => {
    const exportsBySubpath = Object.fromEntries(
      runtimeSubpaths(pkg).map(subpath => [subpath, importInNode(dir, posix.join(pkg.name, subpath))]),
    )
    expect(exportsBySubpath).toMatchSnapshot()
  }, 60_000)

  it.skipIf(!built)('emits the same declaration files', () => {
    expect(declarationFiles(dir)).toMatchSnapshot()
  })
})
