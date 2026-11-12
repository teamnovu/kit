import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import ts from 'typescript'
import type { Plugin } from 'vite'
import { vi } from 'vitest'
import { generateSerializationGroups, type GenerateSerializationGroupsPluginOptions } from '../src/index'

export type GeneratedFile = 'resourceSerializationGroups.ts' | 'operations.ts'

type BuildStartHook = (this: { addWatchFile: (id: string) => void }) => Promise<void>
type HotUpdateHook = (context: { file: string }) => Promise<void>

/**
 * Dedents a template literal and keeps backslashes verbatim, so PHP class names read as in the backend config.
 */
export function yaml(strings: TemplateStringsArray, ...values: unknown[]) {
  const lines = String.raw(strings, ...values)
    .replace(/^\n/, '')
    .trimEnd()
    .split('\n')
  const indent = Math.min(...lines.filter(line => line.trim()).map(line => line.search(/\S/)))
  return `${lines.map(line => line.slice(indent)).join('\n')}\n`
}

async function writeFile(directory: string, file: string, content: string) {
  const filePath = path.join(directory, file)
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, content, 'utf8')
  return filePath
}

export async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'kit-api-platform-types-'))
  const serializationFileDirectory = path.join(root, 'backend', 'config', 'serializer')
  const mappingFileDirectory = path.join(root, 'backend', 'config', 'api_platform')
  const outputDirectory = path.join(root, 'frontend', 'src', 'types', 'generated')
  await fs.mkdir(serializationFileDirectory, { recursive: true })
  await fs.mkdir(mappingFileDirectory, { recursive: true })

  return {
    root,
    serializationFileDirectory,
    mappingFileDirectory,
    outputDirectory,
    writeSerialization: (file: string, content: string) => writeFile(serializationFileDirectory, file, content),
    writeMapping: (file: string, content: string) => writeFile(mappingFileDirectory, file, content),
    read: (file: GeneratedFile) => fs.readFile(path.join(outputDirectory, file), 'utf8'),
    createPlugin: (options: Partial<GenerateSerializationGroupsPluginOptions> = {}) => generateSerializationGroups({
      serializationFileDirectory,
      mappingFileDirectory,
      outputDirectory,
      ...options,
    }),
    remove: () => fs.rm(root, {
      recursive: true,
      force: true,
    }),
  }
}

export async function buildStart(plugin: Plugin) {
  const context = { addWatchFile: vi.fn() }
  await (plugin.buildStart as unknown as BuildStartHook).call(context)
  return context
}

export async function hotUpdate(plugin: Plugin, file: string) {
  await (plugin.handleHotUpdate as unknown as HotUpdateHook)({ file })
}

export function syntaxErrors(source: string) {
  const { diagnostics = [] } = ts.transpileModule(source, { reportDiagnostics: true })
  return diagnostics.map(diagnostic => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
}

function propertyName(name: ts.PropertyName) {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : name.getText()
}

function membersToValue(members: ts.NodeArray<ts.TypeElement>): Record<string, unknown> {
  return Object.fromEntries(members.filter(ts.isPropertySignature).map((member) => {
    const name = propertyName(member.name)
    const value = typeToValue(member.type)
    return [name, name === 'groups' ? [value].flat() : value]
  }))
}

function typeToValue(node: ts.TypeNode | undefined): unknown {
  if (!node) {
    return undefined
  }
  if (ts.isTypeLiteralNode(node)) {
    return membersToValue(node.members)
  }
  if (ts.isUnionTypeNode(node)) {
    return node.types.map(typeToValue)
  }
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal)) {
    return node.literal.text
  }
  return node.getText()
}

/**
 * Reads the generated declarations back into plain data: interfaces become objects, string literal unions become arrays.
 * `groups` and `OperationsUnionType` are always arrays, even with a single member.
 */
export function parseGenerated(source: string): Record<string, unknown> {
  const sourceFile = ts.createSourceFile('generated.ts', source, ts.ScriptTarget.Latest, true)

  return Object.fromEntries(sourceFile.statements.flatMap((statement) => {
    if (ts.isInterfaceDeclaration(statement)) {
      return [[statement.name.text, membersToValue(statement.members)]]
    }
    if (ts.isTypeAliasDeclaration(statement)) {
      return [[statement.name.text, [typeToValue(statement.type)].flat()]]
    }
    return []
  }))
}
