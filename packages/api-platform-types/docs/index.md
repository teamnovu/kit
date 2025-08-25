# @teamnovu/kit-api-platform-types

Advanced TypeScript types for API Platform integration with serialization groups and type-safe entity definitions.

## Installation

```bash
pnpm add @teamnovu/kit-api-platform-types
```

## Purpose

This package provides type-safe definitions for API Platform entities and endpoints by leveraging serialization groups. The main goal is to ensure that your TypeScript types exactly match what your API Platform backend expects and returns.
It has two parts, one part are multiple typescript types that you can use directly and the second part is a vite plugin designed to automatically generate types from your API Platform entities.

## Usage Guide WITH Automatic Type Generation

If you want to automatically generate TypeScript types from your API Platform entities, follow the steps below. This is mostly useful for monorepos which use vite as a build tool.

### Use the Vite Plugin
To automatically generate types, import `generateSerializationGroups` from the bundle and use it in your vite config:

```typescript
// vite.config.ts
import { generateSerializationGroups } from '@teamnovu/kit-api-platform-types';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => ({
  plugins: [
    // other plugins
    generateSerializationGroups({
      serializationFileDirectory: fileURLToPath(new URL('../../config/serialization', import.meta.url)),
      mappingFileDirectory: fileURLToPath(new URL('../../config/api_platform', import.meta.url)),
      outputDirectory: fileURLToPath(new URL('./src/types/apiPlatformSerializationGroups', import.meta.url)),
    }),
  ]
}));
```
There are two more optional parameters `modifyResourceSerializationPropertyDefinition` and `modifyOperationSerializationPropertyDefinition` with which you can modify the groups before they are written (e.g. to add a prefix for role based serialization groups).
An example to add the prefix `role_admin:` to every output group of the operation definitions:
```typescript
modifyOperationSerializationPropertyDefinition: definition => ({
  ...definition,
  outputGroups: definition.outputGroups.concat(definition.outputGroups.map(group => `role_admin:${group}`)),
})
```

This plugin will generate the groups on every start of the dev server and it will also hot update if you change one of the files in the `serializationFileDirectory` or `mappingFileDirectory`.

Note: You should add the `outputDirectory` to your `.gitignore` file, as it is generated automatically.

### When to Use Each Type

#### `SpecifyResource<TSerializationObject, TResourceType>`
Use this for **defining a resource and its properties**. Here `TSerializationObject` is the interface which was automatically generated with the vite plugin that corresponds to your API resource. The second part `TResourceType` is the type which associates to every property of the resource its type.

#### `SpecifyGeneratedApiOutput<T, TOperationDefinition, TOperationName>`
Use this for **API endpoint outputs** - the types you get back from the API. Here `T` is the resource type you defined with `SpecifyResource`, `TOperationDefinition` is the operation definition interface which was automatically generated with the vite plugin, and `TOperationName` is the name of the operation you want to use. It returns an object with all properties (nested) just as ApiPlatform will return it.

#### `SpecifyGeneratedApiInput<T, TOperationDefinition, TOperationName>`
Use this for **API endpoint inputs** - the types you send to the API for create/update operations. Here `T` is the resource type you defined with `SpecifyResource`, `TOperationDefinition` is the operation definition interface which was automatically generated with the vite plugin, and `TOperationName` is the name of the operation you want to use. It returns a partial structure allowing IRIs for references.

#### `PickApiProps<T, Props>`
Use this in **components and UI logic** where no endpoints are involved. It takes dot-connected paths and returns an object with all matching nested properties.

### Example Usage

#### `SpecifyResource<TSerializationObject, TResourceType>`

Defines a resource.

```typescript
export type ApiUser = SpecifyResource<UserSerializationGroups, {
  id: number
  name: string
  address: ApiAddress // another resource defined with SpecifyResource
}>
```

#### `SpecifyGeneratedApiOutput<T, TOperationDefinition, TOperationName>`

For API outputs - types returned from the API.

```typescript
type UserListResponse = SpecifyGeneratedApiOutput<ApiUser, UserOperations, 'GetCollection'>
```

#### `SpecifyGeneratedApiInput<T, TOperationDefinition, TOperationName>`

For API inputs - types sent to the API.

```typescript
type CreateUserData = SpecifyGeneratedApiInput<ApiUser, UserOperations, 'Post'>
```

#### `PickApiProps<Entity, PropertyKeys>`

Picks specific properties using dot-notation paths.

```typescript
type UserDisplayData = PickApiProps<ApiUser, 'id' | 'name' | 'profile.avatar'>
```

## Usage Guide WITHOUT Automatic Type Generation

If for some reason you cannot or don't want to use the automatic type generation, you can still use the types provided in this package directly. You will just need to manually write all serialization groups and you won't have the full backend-to-frontend type safety.

### When to Use Each Type

#### `SpecifyApiOutput<T, TGroup>`
Use this for **API endpoint outputs** - the types you get back from the API. It takes a union of serialization groups and returns an object with all properties (nested) that match those groups.

#### `SpecifyApiInput<T, TGroup>`  
Use this for **API endpoint inputs** - the types you send to the API for create/update operations. It returns a partial structure allowing IRIs for references.

#### `PickApiProps<T, Props>`
Use this in **components and UI logic** where no endpoints are involved. It takes dot-connected paths and returns an object with all matching nested properties.

#### `ApiProperty<T, TGroup>`
Use this for **defining entity properties**. Each property must specify its type and the serialization groups it belongs to.

### ⚠️ Critical: Serialization Group Synchronization

> **WARNING: Always ensure serialization groups match exactly between TypeScript and API Platform**
> 
> The serialization groups you define in TypeScript **must match exactly** with those defined in your API Platform backend. Mismatched groups will result in unexpected behavior.

#### For `SpecifyApiOutput` and `SpecifyApiInput`:
- ✅ **DO**: Match the exact serialization groups defined on your API Platform endpoints
- ❌ **DON'T**: Guess or assume serialization groups - verify them in your backend code

#### For `ApiProperty` definitions:
- ✅ **DO**: Use the same serialization groups as defined on the corresponding backend entity property
- ❌ **DON'T**: Add or remove groups without updating the backend accordingly

### ⚠️ Synchronization Checklist

Before using these types:

1. **Check your API Platform entity definitions** for the exact serialization group names
2. **Verify endpoint-specific groups** in your API Platform controllers/resources  
3. **Test your types** against actual API responses to ensure they match
4. **Update both sides** when changing serialization groups (backend + TypeScript)

### Example Usage

#### `ApiEntity`

Base interface for all API entities.

#### `ApiProperty<TType, TGroups>`

Defines entity properties with serialization groups.

```typescript
export interface ApiUser extends ApiEntity {
  id: ApiProperty<number, 'user:list' | 'user:read'>
  name: ApiProperty<string, 'user:list' | 'user:read'>
}
```

#### `SpecifyApiOutput<T, TGroup>`

For API outputs - types returned from the API.

```typescript
type UserListResponse = SpecifyApiOutput<ApiUser, 'user:list'>
```

#### `SpecifyApiInput<T, TGroup>`

For API inputs - types sent to the API.

```typescript
type CreateUserData = SpecifyApiInput<ApiUser, 'user:write'>
```

#### `PickApiProps<Entity, PropertyKeys>`

Picks specific properties using dot-notation paths.

```typescript
type UserDisplayData = PickApiProps<ApiUser, 'id' | 'name' | 'profile.avatar'>
```

## Other Exported Types

- `ApiResponseMeta<TType, TID>` - API Platform metadata
- `ApiResponse<T, TType, TID>` - Base response with metadata
- `ApiCollectionResponse<T, TType, TID>` - Collections with `member`, `totalItems`
- `LegacyApiCollectionResponse<T, TType, TID>` - Collections with `hydra:member`, `hydra:totalItems`
- `IRI` - String alias for resource identifiers
- `GenerateSerializationGroupsPluginOptions` - Options for the Vite plugin
- `ResourceSerializationDefinition` - The interface for resource serialization definitions
- `OperationSerializationDefinition` - The interface for operation serialization definitions
