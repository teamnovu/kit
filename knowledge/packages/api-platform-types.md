---
type: npm Package
title: "@teamnovu/kit-api-platform-types"
description: TypeScript types for API Platform resources plus a Vite plugin that generates serialization-group types from Symfony YAML.
resource: https://www.npmjs.com/package/@teamnovu/kit-api-platform-types
tags: [api-platform, typescript, vite-plugin, codegen]
---

# Facts (version 0.2.5)

- **Plugin:** `generateSerializationGroups(options)`. Options: `serializationFileDirectory`,
  `mappingFileDirectory`, `outputDirectory`, plus two optional modifier callbacks for property definitions.
- **Hooks:**
  - `buildStart` watches both directories and writes two files: `resourceSerializationGroups.ts` (interfaces
    `XSerializationGroups`) and `operations.ts` (`XOperations` plus `OperationsUnionType`)
  - `handleHotUpdate` routes changes with a raw `startsWith` check
- **Inputs:** reads `**/*.{yaml,yml}` via glob, in no guaranteed order, and parses them with `yaml.parse`.
  - **Serialization YAML:** `{ FQCN: { attributes: { prop: { groups, serialized_name | serializedName } } } }`
  - **Mapping YAML:** `{ resources: { FQCN: { shortName, normalizationContext, denormalizationContext,
    operations } } }`
  - Only Patch/Post/Put operations get input groups. An empty YAML file throws.
- **Code generation:** uses the **TypeScript compiler API at consumer build time** (`ts.factory.*`,
  `createPrinter`).
- **CJS interop risk:** source and `dist` use `import ts, { NodeFlags } from 'typescript'`, a named import from
  a CJS module. That works only thanks to TypeScript's CJS export annotations, which is a risk with
  TypeScript 6.
- **Runtime deps:** `glob ^11`, `typescript ^5.9.2`, `yaml ^2.8.1`. **Peer:** `vite ^7.0.0 || ^8.0.0`.
- **Tests:** none as of 2026-11-11.

# Update notes

- Widen `typescript` to `^5.9.2 || ^6.0.0` (TypeScript 7 is excluded; see [compatibility](../dependencies/compatibility.md)).
- glob 14 fixes an advisory (`>=9 <=14.0.1`).
