export interface GenerateSerializationGroupsPluginOptions {
  /** the directory where the resource serialization files are located */
  serializationFileDirectory: string
  /** the directory where the mapping files are located */
  mappingFileDirectory: string
  /** the directory where the generated TypeScript files will be written */
  outputDirectory: string
  /** a function to modify the serialization groups of resource properties before they are written */
  modifyResourceSerializationPropertyDefinition?:
  (propertyDefinition: ParsedResourceSerializationGroupsPropertyDefinition) => ParsedResourceSerializationGroupsPropertyDefinition
  /** a function to modify the serialization groups of operation inputs and outputs before they are written */
  modifyOperationSerializationPropertyDefinition?: (operationDefinition:
  ParsedOperationSerializationGroupsPropertyDefinition) => ParsedOperationSerializationGroupsPropertyDefinition
}

export interface ParsedResourceSerializationGroupsPropertyDefinition {
  name: string
  groups: string[]
}

export interface ParsedResourceSerializationGroups {
  resourceClass: string
  properties: ParsedResourceSerializationGroupsPropertyDefinition[]
}

export interface ParsedOperationSerializationGroupsPropertyDefinition {
  operationName: string
  inputGroups: string[] | null
  outputGroups: string[]
}

export interface ParsedOperationSerializationGroups {
  resourceClass: string
  operations: ParsedOperationSerializationGroupsPropertyDefinition[]
}
