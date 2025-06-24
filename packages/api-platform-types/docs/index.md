# @teamnovu/kit-api-platform-types

Advanced TypeScript types for API Platform integration with serialization groups and type-safe entity definitions.

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

## Installation

```bash
pnpm add @teamnovu/kit-api-platform-types
```
