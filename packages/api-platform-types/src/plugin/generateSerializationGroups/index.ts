import type { Plugin } from 'vite'
import fs from 'fs'
import ts, { NodeFlags } from 'typescript'
import type { GenerateSerializationGroupsPluginOptions } from './types'
import { loadOperationSerializationGroups, loadResourceSerializationGroups } from './parser/yaml'

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
  function writeToFile(statements: readonly ts.Statement[], fileName: string) {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
      omitTrailingSemicolon: true,
    })
    const sourceFile = ts.factory.createSourceFile(statements, ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), NodeFlags.None)

    const output = printer.printFile(sourceFile)

    fs.writeFileSync(`${options.outputDirectory}/${fileName}`, output, 'utf8')
  }

  /**
   * Generates TypeScript interfaces for resource serialization groups.
   */
  function generateResourceGroups() {
    const resourceSerializationGroups = loadResourceSerializationGroups(options.serializationFileDirectory)

    const interfaces = resourceSerializationGroups.map((resourceSerializationGroup) => {
      const propertyDeclarations = resourceSerializationGroup.properties.map((propertyGroups) => {
        const groups = options.modifyResourceSerializationGroups?.(propertyGroups.groups, propertyGroups) ?? propertyGroups.groups
        return ts.factory.createPropertySignature(
          undefined,
          propertyGroups.name,
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
    fs.mkdirSync(options.outputDirectory, { recursive: true })
    writeToFile(interfaces, 'resourceSerializationGroups.ts')
  }

  /**
   * Generates TypeScript interfaces for operation serialization groups.
   */
  function generateOperationsGroups() {
    const mappingSerializationGroups = loadOperationSerializationGroups(options.mappingFileDirectory)

    const interfaceDeclarations = mappingSerializationGroups.map((mappingSerializationGroup) => {
      const propertyDeclarations = mappingSerializationGroup.operations.map((operation) => {
        const propertySignatures: ts.TypeElement[] = []

        if (operation.inputGroups?.length) {
          const groups = options.modifyOperationSerializationGroups?.(operation.inputGroups, operation) ?? operation.inputGroups
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
                    groups.map(group => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(group, true))),
                  ),
                ),
              ]),
            ),
          )
        }

        if (operation.outputGroups.length) {
          const groups = options.modifyOperationSerializationGroups?.(operation.outputGroups, operation) ?? operation.outputGroups
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
                    groups.map(group => ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(group, true))),
                  ),
                ),
              ]),
            ),
          )
        }

        return ts.factory.createPropertySignature(
          undefined,
          operation.operationName,
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
    fs.mkdirSync(options.outputDirectory, { recursive: true })
    writeToFile(interfaceDeclarations, 'operations.ts')
  }

  return {
    name: 'generate-serialization-groups',
    buildStart() {
      generateResourceGroups()
      generateOperationsGroups()
      // eslint-disable-next-line no-console
      console.log('✅ ApiPlatform serialization group interfaces generated successfully.')
    },
  }
}
