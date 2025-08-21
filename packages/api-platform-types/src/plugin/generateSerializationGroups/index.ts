import type { Plugin } from 'vite'
import fs from 'fs/promises'
import ts, { NodeFlags } from 'typescript'
import type { GenerateSerializationGroupsPluginOptions } from './types'
import { loadOperationSerializationGroups, loadResourceSerializationGroups } from './parser/yaml'
import { trimEnd, trimStart } from 'lodash-es'

/**
 * Extracts the name of the resource class (i.e. last part) from its full namespace name.
 */
function getNameFromResourceClass(fullResourceName: string) {
  const parts = fullResourceName.split('\\')
  return parts[parts.length - 1]
}

/**
 * This vite plugin will generate TypeScript interfaces for ApiPlatform serialization groups.
 * It reads the serialization and mapping files from the specified directories, parses them,
 * and generates TypeScript interfaces that can be used in the frontend application together with
 * the types "SpecifyResource", "SpecifyGeneratedApiOutput" and "SpecifyGeneratedApiInput.
 */
export default function generateSerializationGroups(options: GenerateSerializationGroupsPluginOptions): Plugin {
  /**
   * Writes the given TypeScript statements to a file with the given name.
   */
  async function writeToFile(statements: readonly ts.Statement[], fileName: string) {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      omitTrailingSemicolon: true,
    })
    const sourceFile = ts.factory.createSourceFile(statements, ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), NodeFlags.None)

    const output = printer.printFile(sourceFile)

    await fs.writeFile(`${trimEnd(options.outputDirectory, '/')}/${trimStart(fileName, '/')}`, output, 'utf8')
  }

  /**
   * Generates TypeScript interfaces for resource serialization groups.
   */
  async function generateResourceGroups() {
    const resourceSerializationGroups = await loadResourceSerializationGroups(options.serializationFileDirectory)

    const interfaces = resourceSerializationGroups.map((resourceSerializationGroup) => {
      const propertyDeclarations = resourceSerializationGroup.properties.map((propertyGroups) => {
        const { groups, name } = options.modifyResourceSerializationPropertyDefinition?.(propertyGroups) ?? propertyGroups
        return ts.factory.createPropertySignature(
          undefined,
          name,
          undefined,
          ts.factory.createTypeLiteralNode([
            ts.factory.createPropertySignature(
              undefined,
              'groups',
              undefined,
              ts.factory.createUnionTypeNode(
                groups.map(group => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(group, true))),
              ),
            ),
          ]),
        )
      })

      // returns an interface of type ResourceSerializationDefinition
      return ts.factory.createInterfaceDeclaration(
        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
        `${getNameFromResourceClass(resourceSerializationGroup.resourceClass)}SerializationGroups`,
        [],
        undefined,
        [
          ts.factory.createPropertySignature(
            undefined,
            'resourceClass',
            undefined,
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(resourceSerializationGroup.resourceClass, true)),
          ),
          ts.factory.createPropertySignature(
            undefined,
            'properties',
            undefined,
            ts.factory.createTypeLiteralNode(propertyDeclarations),
          ),
        ],
      )
    })

    // Ensure parent directories exist
    await fs.mkdir(options.outputDirectory, { recursive: true })
    await writeToFile(interfaces, 'resourceSerializationGroups.ts')

    // eslint-disable-next-line no-console
    console.log('✅ ApiPlatform resource serialization group interfaces generated successfully.')
  }

  /**
   * Generates TypeScript interfaces for operation serialization groups.
   */
  async function generateOperationsGroups() {
    const mappingSerializationGroups = await loadOperationSerializationGroups(options.mappingFileDirectory)

    const interfaceDeclarations = mappingSerializationGroups.map((mappingSerializationGroup) => {
      const propertyDeclarations = mappingSerializationGroup.operations.map((operation) => {
        const propertySignatures: ts.TypeElement[] = []

        const { inputGroups, outputGroups, operationName } = options.modifyOperationSerializationPropertyDefinition?.(operation) ?? operation

        if (inputGroups?.length) {
          propertySignatures.push(
            ts.factory.createPropertySignature(
              undefined,
              'input',
              undefined,
              ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                  undefined,
                  'groups',
                  undefined,
                  ts.factory.createUnionTypeNode(
                    inputGroups.map(group => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(group, true))),
                  ),
                ),
              ]),
            ),
          )
        }

        if (outputGroups.length) {
          propertySignatures.push(
            ts.factory.createPropertySignature(
              undefined,
              'output',
              undefined,
              ts.factory.createTypeLiteralNode([
                ts.factory.createPropertySignature(
                  undefined,
                  'groups',
                  undefined,
                  ts.factory.createUnionTypeNode(
                    outputGroups.map(group => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(group, true))),
                  ),
                ),
              ]),
            ),
          )
        }

        return ts.factory.createPropertySignature(
          undefined,
          operationName,
          undefined,
          ts.factory.createTypeLiteralNode(
            propertySignatures,
          ),
        )
      })

      // returns an interface of type OperationSerializationDefinition
      return ts.factory.createInterfaceDeclaration(
        [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
        `${getNameFromResourceClass(mappingSerializationGroup.resourceClass)}Operations`,
        [],
        undefined,
        [
          ts.factory.createPropertySignature(
            undefined,
            'resourceClass',
            undefined,
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(mappingSerializationGroup.resourceClass, true)),
          ),
          ts.factory.createPropertySignature(
            undefined,
            'operations',
            undefined,
            ts.factory.createTypeLiteralNode(propertyDeclarations),
          ),
        ],
      )
    })

    // Ensure parent directories exist
    await fs.mkdir(options.outputDirectory, { recursive: true })
    await writeToFile(interfaceDeclarations, 'operations.ts')

    // eslint-disable-next-line no-console
    console.log('✅ ApiPlatform operation serialization group interfaces generated successfully.')
  }

  return {
    name: 'generate-serialization-groups',
    buildStart() {
      generateResourceGroups()
      generateOperationsGroups()
      this.addWatchFile(options.serializationFileDirectory)
      this.addWatchFile(options.mappingFileDirectory)
    },
    handleHotUpdate(args) {
      const filePath = args.file

      // only handle updates for files in the specified directories
      if (filePath.startsWith(options.serializationFileDirectory)) {
        // If a watched file has changed, re-generate the serialization groups
        generateResourceGroups()
      }
      if (filePath.startsWith(options.mappingFileDirectory)) {
        generateOperationsGroups()
      }
    },
  }
}
