import fs from 'fs'
import { parse } from 'yaml'
import path from 'path'
import type {
  ParsedOperationSerializationGroups,
  ParsedOperationSerializationGroupsPropertyDefinition,
  ParsedResourceSerializationGroups,
  ParsedResourceSerializationGroupsPropertyDefinition,
} from '../types'

/**
 * Recursively retrieves all YAML files in a directory and its subdirectories.
 */
function getAllYAMLFiles(dir: string): string[] {
  let results: string[] = []

  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const file of list) {
    const filePath = path.join(dir, file.name)

    if (file.isDirectory()) {
      results = results.concat(getAllYAMLFiles(filePath))
    } else if (file.isFile() && /\.(ya?ml)$/i.test(file.name)) {
      results.push(filePath)
    }
  }

  return results
}

/**
 * Structure of a resource serialization file
 */
interface SerializationFileContent {
  [fullResourcePath: string]: {
    attributes?: {
      [key: string]: {
        groups?: string[]
        serialized_name?: string
        serializedName?: string
      }
    }
  }
}

/**
 * Structure of a mapping file
 */
interface MappingFileContent {
  resources?: {
    [fullResourcePath: string]: {
      normalizationContext?: {
        groups?: string[]
      }
      denormalizationContext?: {
        groups?: string[]
      }
      operations?: {
        [operationName: string]: {
          normalizationContext?: {
            groups?: string[]
          }
          denormalizationContext?: {
            groups?: string[]
          }
          class?: string
        }
      }
    }
  }
}

/**
 * Loads and parses all YAML files in the directory
 */
function loadYAMLFiles<TType extends SerializationFileContent | MappingFileContent>(inputDir: string) {
  const yamlFiles = getAllYAMLFiles(inputDir)
  const parsedFiles: TType[] = []

  yamlFiles.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf8')
    try {
      parsedFiles.push(parse(content))
    } catch (err) {
      console.error(`Error parsing YAML file ${filePath}:`, err)
    }
  })

  return parsedFiles
}

/**
 * Loads resource serialization groups from YAML files in the specified directory.
 */
export function loadResourceSerializationGroups(inputDir: string): ParsedResourceSerializationGroups[] {
  const fileContents = loadYAMLFiles<SerializationFileContent>(inputDir)

  const output: ParsedResourceSerializationGroups[] = []

  fileContents.forEach(
    (fileContent) => {
      Object.entries(fileContent).forEach(([fullResourceName, resourceData]) => {
        if (resourceData.attributes) {
          const properties: ParsedResourceSerializationGroupsPropertyDefinition[] = []
          Object.entries(resourceData.attributes).forEach(([attributeName, attributeData]) => {
            if (attributeData.groups?.length) {
              properties.push({
                name: attributeData.serialized_name ?? attributeData.serializedName ?? attributeName,
                groups: attributeData.groups,
              })
            }
          })

          // ignore entities without properties
          if (properties.length) {
            output.push({
              resourceClass: fullResourceName,
              properties,
            })
          }
        }
      })
    },
  )

  return output
}

/**
 * Loads operation serialization groups from YAML files in the specified directory.
 */
export function loadOperationSerializationGroups(inputDir: string): ParsedOperationSerializationGroups[] {
  const fileContents = loadYAMLFiles<MappingFileContent>(inputDir)

  const output: ParsedOperationSerializationGroups[] = []

  fileContents.forEach(
    (fileObject) => {
      Object.entries(fileObject.resources ?? {}).forEach(([fullResourceName, resourceData]) => {
        const globalInputGroups = resourceData.denormalizationContext?.groups ?? []
        const globalOutputGroups = resourceData.normalizationContext?.groups ?? []

        const operations = Object.entries(resourceData.operations ?? {})
        if (operations.length) {
          const operationGroupDefinitions: ParsedOperationSerializationGroupsPropertyDefinition[] = []

          operations.forEach(([operationName, operationData]) => {
            const operationClass = operationData.class ?? operationName
            const hasInput = ['ApiPlatform\\Metadata\\Patch', 'ApiPlatform\\Metadata\\Post', 'ApiPlatform\\Metadata\\Put'].includes(operationClass)

            const inputGroups = hasInput ? operationData.denormalizationContext?.groups ?? globalInputGroups : null
            const outputGroups = operationData.normalizationContext?.groups ?? globalOutputGroups

            const improvedOperationName = operationName.replaceAll('\\', '').replace('ApiPlatformMetadata', '')

            if (inputGroups?.length || outputGroups.length) {
              operationGroupDefinitions.push({
                operationName: improvedOperationName,
                inputGroups,
                outputGroups,
              })
            }
          })

          // ignore operations without groups
          if (operationGroupDefinitions.length) {
            output.push({
              resourceClass: fullResourceName,
              operations: operationGroupDefinitions,
            })
          }
        }
      })
    },
  )

  return output
}
