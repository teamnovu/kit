# Shopware Composables

A comprehensive collection of Vue 3 composables for Shopware Store API integration with TanStack Query for state management and caching.

Install with `npm i @teamnovu/kit-shopware-composables`

## Features

- ✅ **Vue 3 Composition API** - Built for Vue 3 with full TypeScript support
- ✅ **TanStack Query Integration** - Powerful caching, background updates, and query management
- ✅ **Type-safe Operations** - Generated types from Shopware API schema
- ✅ **Modular Architecture** - Import only what you need
- ✅ **Optimistic Updates** - Smooth UX with optimistic mutation handling
- ✅ **Docker Development** - Ready-to-use Shopware development environment

## Quick Start

```typescript
import { 
  useReadProductListingQuery,
  useReadCartQuery,
  useAddLineItemMutation,
  usePaymentMethods 
} from '@teamnovu/kit-shopware-composables'

export default defineComponent({
  setup() {
    // Query products
    const { data: products, isLoading } = useReadProductListingQuery('category-seo-url')
    
    // Manage cart
    const { data: cart } = useReadCartQuery()
    const addToCart = useAddLineItemMutation()
    
    // Checkout helpers
    const { paymentMethods, setPaymentMethod } = usePaymentMethods()
    
    return {
      products,
      isLoading,
      cart,
      addToCart,
      paymentMethods,
      setPaymentMethod
    }
  }
})
```

## Setup & Configuration

### 1. Client Injection

Provide the Shopware client to your Vue app:

```typescript
import { createApp } from 'vue'
import { ShopwareClient } from '@teamnovu/kit-shopware-api-client'
import { provideShopwareQueryClient } from '@teamnovu/kit-shopware-composables'

const app = createApp(App)

const client = new ShopwareClient({
  baseURL: 'https://your-shopware-store.com',
  apiKey: 'your-api-key'
})

provideShopwareQueryClient(client)
app.mount('#app')
```

### 2. TanStack Query Setup

Install and configure TanStack Query:

```bash
npm install @tanstack/vue-query
```

```typescript
import { VueQueryPlugin } from '@tanstack/vue-query'

app.use(VueQueryPlugin)
```

## Query Composables

### Product Queries

#### useReadCompactProductListingQuery
Query products by category or listing criteria:

```typescript
const { data, isLoading, error } = useReadCompactProductListingQuery('category-seo-url', {
  query: {
    limit: 20,
    page: 1,
    'filter[price][gte]': 10
  }
})
```

#### useReadCustomProductDetailQuery
Get detailed product information:

```typescript
const { data: product } = useReadCustomProductDetailQuery('product-seo-url')
```

#### useReadCategoryListQuery
Fetch category navigation:

```typescript
const { data: categories } = useReadCategoryListQuery()
```

### Cart Queries & Mutations

#### useReadCartQuery
Get current cart state:

```typescript
const { data: cart, refetch } = useReadCartQuery()
```

#### useAddLineItemMutation
Add products to cart:

```typescript
const addToCart = useAddLineItemMutation()

const handleAddToCart = () => {
  addToCart.mutate({
    items: [{
      id: 'product-id',
      quantity: 1,
      type: 'product'
    }]
  })
}
```

#### useUpdateLineItemMutation
Update cart item quantities:

```typescript
const updateItem = useUpdateLineItemMutation()

updateItem.mutate({
  items: [{
    id: 'line-item-id',
    quantity: 3
  }]
})
```

#### useRemoveLineItemMutation
Remove items from cart:

```typescript
const removeItem = useRemoveLineItemMutation()

removeItem.mutate({
  ids: ['line-item-id']
})
```

### Customer Queries & Mutations

#### useReadCustomerQuery
Get current customer data:

```typescript
const { data: customer } = useReadCustomerQuery()
```

#### useLoginCustomerMutation
Handle customer login:

```typescript
const login = useLoginCustomerMutation()

login.mutate({
  email: 'user@example.com',
  password: 'password'
})
```

### Address Management

#### useListAddressQuery
Fetch customer addresses:

```typescript
const { data: addresses } = useListAddressQuery()
```

### Context & Settings

#### useReadContextQuery
Get current store context (currency, language, etc.):

```typescript
const { data: context } = useReadContextQuery()
```

#### useUpdateContextMutation
Update store context:

```typescript
const updateContext = useUpdateContextMutation()

updateContext.mutate({
  currencyId: 'eur-currency-id',
  languageId: 'en-language-id'
})
```

## Helper Composables

### Checkout Helpers

#### usePaymentMethods
Manage payment methods:

```typescript
const {
  paymentMethods,      // Available payment methods
  activePaymentMethod, // Currently selected method
  setPaymentMethod,    // Function to change method
  isSaving            // Loading state
} = usePaymentMethods()
```

#### useShippingMethods
Manage shipping methods:

```typescript
const {
  shippingMethods,
  activeShippingMethod,
  setShippingMethod,
  isSaving
} = useShippingMethods()
```

#### useCheckoutAddresses
Manage customer addresses:

```typescript
const {
  addresses,
  billingAddress,
  shippingAddress,
  setBillingAddress,
  setShippingAddress,
  isSaving
} = useCheckoutAddresses()
```

### Product Helpers

#### useProductPrice
Calculate product pricing:

```typescript
const { 
  price,          // Calculated price object
  displayPrice,   // Formatted display price
  wasPrice,       // Original price (if on sale)
  percentage      // Discount percentage
} = useProductPrice(product, quantity)
```

#### useProductVariantForOptions
Handle product variants:

```typescript
const {
  variant,        // Selected variant
  options,        // Available options
  selectOption    // Function to select option
} = useProductVariantForOptions(product, selectedOptions)
```

### General Helpers

#### usePagination
Handle paginated results:

```typescript
const {
  page,
  limit,
  total,
  totalPages,
  nextPage,
  prevPage,
  goToPage
} = usePagination(initialPage, initialLimit)
```

#### useSeoUrl
Handle SEO URL transformations:

```typescript
const { seoUrl, canonicalUrl } = useSeoUrl(path)
```

#### useIsLoggedIn
Check authentication status:

```typescript
const { isLoggedIn, customer } = useIsLoggedIn()
```

## Utility Functions

### useOptimistic
Handle optimistic updates:

```typescript
const { 
  optimisticValue,
  updateOptimistic 
} = useOptimistic(initialValue)
```

### unrefOptions
Utility for unreferencing reactive options:

```typescript
const unrefdOptions = unrefOptions(maybeReactiveOptions)
```

## Development Setup

### Docker Environment

The package includes a complete Docker setup for Shopware development:

```bash
# Generate API types
npm run gen-types

# Start development environment
cd docker && docker-compose up
```

### Type Generation

Generate TypeScript types from your Shopware instance:

```bash
npm run gen-types
```

This will:
1. Fetch the OpenAPI schema from your Shopware store
2. Generate TypeScript types in `api-types/`
3. Update operation definitions

## Best Practices

### Query Keys
Query keys are automatically generated and cached. Use the provided key factories for consistency:

```typescript
import { productKeys, cartKeys, customerKeys } from '@teamnovu/kit-shopware-composables'

// Access query keys for manual cache management
queryClient.invalidateQueries(productKeys.lists())
queryClient.setQueryData(cartKeys.get(), newCartData)
```

### Error Handling
Handle errors consistently across queries:

```typescript
const { data, error, isError } = useReadProductListingQuery('category')

if (isError && error instanceof ShopwareApiError) {
  console.error('Shopware API Error:', error.status, error.response)
}
```

### Loading States
Leverage TanStack Query's built-in loading states:

```typescript
const { data, isLoading, isFetching, isStale } = useReadCartQuery()

// isLoading: First load
// isFetching: Any fetch (including background refetch)
// isStale: Data is outdated
```

## Integration Examples

### E-commerce Product List

```vue
<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <ProductCard 
        v-for="product in products?.elements" 
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>
  </div>
</template>

<script setup>
import { useReadCompactProductListingQuery, useAddLineItemMutation } from '@teamnovu/kit-shopware-composables'

const { data: products, isLoading, error } = useReadCompactProductListingQuery('category-seo-url')
const addToCart = useAddLineItemMutation()

const handleAddToCart = (productId) => {
  addToCart.mutate({
    items: [{ id: productId, quantity: 1, type: 'product' }]
  })
}
</script>
```

### Checkout Flow

```vue
<script setup>
import { 
  useReadCartQuery,
  usePaymentMethods,
  useShippingMethods,
  useCheckout 
} from '@teamnovu/kit-shopware-composables'

const { data: cart } = useReadCartQuery()
const { paymentMethods, setPaymentMethod } = usePaymentMethods()
const { shippingMethods, setShippingMethod } = useShippingMethods()
const { checkout, isCheckingOut } = useCheckout()

const handleCheckout = async () => {
  try {
    const order = await checkout()
    // Handle successful checkout
  } catch (error) {
    // Handle checkout error
  }
}
</script>
```
