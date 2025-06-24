# Shopware API Client

A TypeScript client for the Shopware Store API with full type safety and event-driven context management.

Install with `npm i @teamnovu/kit-shopware-api-client`

## Features

- ✅ **Type-safe API calls** - Full TypeScript support with operation-based type inference
- ✅ **Automatic context token management** - Handles authentication tokens automatically
- ✅ **Event-driven architecture** - Subscribe to context token changes
- ✅ **URL parameter interpolation** - Dynamic URL path parameters with type safety
- ✅ **Query parameter support** - Type-safe query string generation
- ✅ **SEO URLs support** - Optional SEO-friendly URL responses
- ✅ **Error handling** - Custom error types with response details

## Basic Usage

```typescript
import { ShopwareClient } from '@teamnovu/kit-shopware-api-client'

// Initialize the client
const client = new ShopwareClient({
  baseURL: 'https://your-shopware-store.com',
  apiKey: 'your-api-key',
  includeSeoUrls: true,
  language: 'language-id' // optional
})

// Make API calls using operation strings
const products = await client.query('readProductListing post /product-listing', {
  body: {
    // request body
  }
})

// With URL parameters
const product = await client.query('readProduct post /product/{productId}', {
  params: {
    productId: 'product-uuid'
  }
})

// With query parameters
const categories = await client.query('readCategoryList post /category', {
  query: {
    limit: 10,
    page: 1
  }
})
```

## Client Configuration

### ShopwareClientOptions

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `baseURL` | `string` | ✅ | - | The base URL of your Shopware store |
| `apiKey` | `string` | ✅ | - | Your Shopware Store API access key |
| `language` | `string` | ❌ | `undefined` | Language ID for localized responses |
| `contextToken` | `string` | ❌ | `undefined` | Initial context token for authenticated requests |
| `includeSeoUrls` | `boolean` | ❌ | `false` | Include SEO-friendly URLs in responses |
| `reflectContextToken` | `boolean` | ❌ | `true` | Automatically update context token from responses |

## Operation Format

Operations follow the pattern: `{operationName} {httpMethod} {urlPath}`

Examples:
- `'readProductListing post /product-listing'`
- `'readProduct post /product/{productId}'`
- `'addLineItem patch /checkout/cart/line-item'`

## Context Token Management

The client automatically manages context tokens for session handling:

```typescript
// Listen for context token changes
client.on('contextToken', (token) => {
  console.log('New context token:', token)
  // Store token for future requests
})

// Manually set context token
client.setContextToken('your-context-token')
```

## Error Handling

The client throws `ShopwareApiError` for API failures:

```typescript
import { ShopwareApiError } from '@teamnovu/kit-shopware-api-client'

try {
  const result = await client.query('someOperation post /some-endpoint')
} catch (error) {
  if (error instanceof ShopwareApiError) {
    console.error('API Error:', error.message)
    console.error('Status:', error.status)
    console.error('Response:', error.response)
  }
}
```

## Advanced Usage

### Raw Response Access

Use `queryRaw()` to access the raw fetch Response:

```typescript
const response = await client.queryRaw('readProduct post /product/{productId}', {
  params: { productId: 'uuid' }
})

const data = await response.json()
const headers = response.headers
```

### Dynamic Configuration

Update client configuration at runtime:

```typescript
client.setBaseURL('https://new-store.com')
client.setApiKey('new-api-key')
client.setLanguage('new-language-id')
client.setIncludeSeoUrls(true)
client.setReflectContextToken(false)
```

## Type Safety

The client provides full TypeScript support when used with generated operation types:

```typescript
type MyOperations = {
  'readProduct post /product/{productId}': {
    body?: { includes?: Record<string, any> }
    response: ProductDetailResponse
  }
  'readProductListing post /product-listing': {
    body: ProductListingCriteria
    response: ProductListingResponse
  }
}

const client = new ShopwareClient<MyOperations>({
  baseURL: 'https://store.com',
  apiKey: 'key'
})

// Now fully type-safe!
const product = await client.query('readProduct post /product/{productId}', {
  params: { productId: 'uuid' } // TypeScript enforces this
})
// product is typed as ProductDetailResponse
```