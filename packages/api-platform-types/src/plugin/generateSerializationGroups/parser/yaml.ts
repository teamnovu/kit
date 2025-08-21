import fs from 'fs/promises'
import { parse } from 'yaml'
import type {
  ParsedOperationSerializationGroups,
  ParsedOperationSerializationGroupsPropertyDefinition,
  ParsedResourceSerializationGroups,
  ParsedResourceSerializationGroupsPropertyDefinition,
} from '../types'
import { glob } from 'glob'

/**
 * Recursively retrieves all YAML files in a directory and its subdirectories.
 */
async function getAllYAMLFiles(dir: string): Promise<string[]> {
  return await glob('**/*.{yaml,yml}', {
    cwd: dir,
    nodir: true,
    absolute: true,
  })
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

async function handleFileRead<TType extends SerializationFileContent | MappingFileContent>(filePath: string): Promise<TType> {
  const content = await fs.readFile(filePath, 'utf8')
  try {
    return parse(content)
  } catch (err) {
    throw new Error (`Error parsing YAML file ${filePath}.`, { cause: err })
  }
}

/**
 * Loads and parses all YAML files in the directory
 */
async function loadYAMLFiles<TType extends SerializationFileContent | MappingFileContent>(inputDir: string) {
  const yamlFiles = await getAllYAMLFiles(inputDir)

  return Promise.all(yamlFiles.map(filePath => handleFileRead<TType>(filePath)))
}

/**
 * Loads resource serialization groups from YAML files in the specified directory.
 */
export async function loadResourceSerializationGroups(inputDir: string): Promise<ParsedResourceSerializationGroups[]> {
  const fileContents = await loadYAMLFiles<SerializationFileContent>(inputDir)

  const output: ParsedResourceSerializationGroups[] = []

  for (const fileContent of fileContents) {
    for (const [fullResourceName, resourceData] of Object.entries(fileContent)) {
      if (resourceData.attributes) {
        const properties: ParsedResourceSerializationGroupsPropertyDefinition[] = []

        for (const [attributeName, attributeData] of Object.entries(resourceData.attributes)) {
          if (attributeData.groups?.length) {
            properties.push({
              name: attributeData.serialized_name ?? attributeData.serializedName ?? attributeName,
              groups: attributeData.groups,
            })
          }
        }

        // ignore entities without properties
        if (properties.length) {
          output.push({
            resourceClass: fullResourceName,
            properties,
          })
        }
      }
    }
  }

  return output
}

/**
 * Loads operation serialization groups from YAML files in the specified directory.
 */
export async function loadOperationSerializationGroups(inputDir: string): Promise<ParsedOperationSerializationGroups[]> {
  const fileContents = await loadYAMLFiles<MappingFileContent>(inputDir)

  const output: ParsedOperationSerializationGroups[] = []

  for (const fileObject of fileContents) {
    for (const [fullResourceName, resourceData] of Object.entries(fileObject.resources ?? {})) {
      const globalInputGroups = resourceData.denormalizationContext?.groups ?? []
      const globalOutputGroups = resourceData.normalizationContext?.groups ?? []

      const operations = Object.entries(resourceData.operations ?? {})
      if (operations.length) {
        const operationGroupDefinitions: ParsedOperationSerializationGroupsPropertyDefinition[] = []

        for (const [operationName, operationData] of operations) {
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
        }

        // ignore operations without groups
        if (operationGroupDefinitions.length) {
          output.push({
            resourceClass: fullResourceName,
            operations: operationGroupDefinitions,
          })
        }
      }
    }
  }

  return output
}
