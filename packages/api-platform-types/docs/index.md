# @teamnovu/kit-api-platform-types

Advanced TypeScript types for API Platform integration with serialization groups and type-safe entity definitions.

## Usage Guide

### Purpose

This package provides type-safe definitions for API Platform entities and endpoints by leveraging serialization groups. The main goal is to ensure that your TypeScript types exactly match what your API Platform backend expects and returns.

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

## Main API Types

### `SpecifyApiOutput<T, TGroup>`

For API outputs - types returned from the API.

```typescript
type UserListResponse = SpecifyApiOutput<ApiUser, 'user:list'>
```

### `SpecifyApiInput<T, TGroup>`

For API inputs - types sent to the API.

```typescript
type CreateUserData = SpecifyApiInput<ApiUser, 'user:write'>
```

### `PickApiProps<Entity, PropertyKeys>`

Picks specific properties using dot-notation paths.

```typescript
type UserDisplayData = PickApiProps<ApiUser, 'id' | 'name' | 'profile.avatar'>
```

## Entity Definition

### `ApiEntity`

Base interface for all API entities.

### `ApiProperty<TType, TGroups>`

Defines entity properties with serialization groups.

```typescript
export interface ApiUser extends ApiEntity {
  id: ApiProperty<number, 'user:list' | 'user:read'>
  name: ApiProperty<string, 'user:list' | 'user:read'>
}
```

## Other Exported Types

- `ApiResponseMeta<TType, TID>` - API Platform metadata
- `ApiResponse<T, TType, TID>` - Base response with metadata
- `ApiCollectionResponse<T, TType, TID>` - Collections with `member`, `totalItems`
- `LegacyApiCollectionResponse<T, TType, TID>` - Collections with `hydra:member`, `hydra:totalItems`
- `IRI` - String alias for resource identifiers
- `Reference` - IRI or array of IRIs
- `ApiPropertyType<TEntity>` - Extracts wrapped type from ApiProperty
- `ApiPropertyGroups<TEntity>` - Extracts serialization groups
- `IsKeyAccessible<R, K, TGroup>` - Tests property accessibility
- `ApiUpdate<T>` - Update operations with id and optional body

## Installation

```bash
pnpm add @teamnovu/kit-api-platform-types
```
