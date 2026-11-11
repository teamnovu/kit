import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useProductPrice } from '../src/helpers/product/useProductPrice'
import type { Schemas } from '../src/query/types/operations'

type CalculatedPrice = Schemas['CalculatedPrice']
type Product = Schemas['Product']

function calculatedPrice(unitPrice: number, quantity: number, overrides: Partial<CalculatedPrice> = {}): CalculatedPrice {
  return {
    apiAlias: 'calculated_price',
    calculatedTaxes: [],
    hasRange: false,
    listPrice: null,
    netPrice: unitPrice,
    positionPrice: unitPrice * quantity,
    quantity,
    rawTotal: unitPrice * quantity,
    referencePrice: null,
    regulationPrice: null,
    taxRules: [],
    taxStatus: 'net',
    totalPrice: unitPrice * quantity,
    unitPrice,
    ...overrides,
  }
}

function product(fields: Partial<Product>) {
  return {
    id: 'product-id',
    apiAlias: 'product',
    calculatedPrices: [],
    ...fields,
  } as Product
}

const referencePrice = {
  apiAlias: 'cart_price_reference',
  hasRange: false,
  listPrice: null,
  price: 39.98,
  purchaseUnit: 0.5,
  referenceUnit: 1,
  regulationPrice: null,
  unitName: 'Liter',
} as CalculatedPrice['referencePrice']

describe('useProductPrice', () => {
  it('uses calculatedPrice for products without tier prices', () => {
    const price = calculatedPrice(19.99, 1, {
      referencePrice,
      listPrice: {
        apiAlias: 'cart_list_price',
        price: 24.99,
        discount: -5,
        percentage: 20,
      },
      regulationPrice: { price: 17.99 },
    })

    const result = useProductPrice(ref(product({ calculatedPrice: price })))

    expect(result.price.value).toEqual(price)
    expect(result.unitPrice.value).toBe(19.99)
    expect(result.totalPrice.value).toBe(19.99)
    expect(result.referencePrice.value).toEqual(referencePrice)
    expect(result.isListPrice.value).toBe(true)
    expect(result.regulationPrice.value).toBe(17.99)
    expect(result.tierPrices.value).toEqual([])
    expect(result.displayFrom.value).toBe(false)
    expect(result.displayFromVariants.value).toBe(false)
  })

  it('exposes tier prices and uses the cheapest tier for products with several tiers', () => {
    const tiers = [
      calculatedPrice(10, 10, { referencePrice }),
      calculatedPrice(9, 20),
      calculatedPrice(8, 21),
    ]

    const result = useProductPrice(ref(product({
      calculatedPrice: calculatedPrice(10, 1),
      calculatedPrices: tiers,
    })))

    expect(result.tierPrices.value).toEqual([
      {
        label: 'to 10',
        quantity: 10,
        unitPrice: 10,
      },
      {
        label: 'to 20',
        quantity: 20,
        unitPrice: 9,
      },
      {
        label: 'from 21',
        quantity: 21,
        unitPrice: 8,
      },
    ])
    expect(result.displayFrom.value).toBe(true)
    expect(result.price.value).toEqual(tiers[2])
    expect(result.unitPrice.value).toBe(8)
    expect(result.totalPrice.value).toBe(168)
    expect(result.referencePrice.value).toEqual(referencePrice)
    expect(result.isListPrice.value).toBe(false)
  })

  it('prefers a single calculatedPrices entry over calculatedPrice', () => {
    const result = useProductPrice(ref(product({
      calculatedPrice: calculatedPrice(6, 1),
      calculatedPrices: [calculatedPrice(5, 1, { referencePrice })],
    })))

    expect(result.unitPrice.value).toBe(5)
    expect(result.referencePrice.value).toEqual(referencePrice)
    expect(result.displayFrom.value).toBe(false)
    expect(result.tierPrices.value).toEqual([
      {
        label: 'from 1',
        quantity: 1,
        unitPrice: 5,
      },
    ])
  })

  it('reports the cheapest variant price for variants with a price range', () => {
    const variant = product({
      parentId: 'parent-id',
      calculatedPrice: calculatedPrice(7, 1),
      calculatedCheapestPrice: {
        hasRange: true,
        unitPrice: 5,
      },
    })

    expect(useProductPrice(ref(variant)).displayFromVariants.value).toBe(5)
    expect(useProductPrice(ref({
      ...variant,
      calculatedPrice: calculatedPrice(5, 1),
    })).displayFromVariants.value).toBe(false)
  })

  it('handles a missing product and reacts to product changes', () => {
    const current = ref<Product | undefined>(undefined)

    const result = useProductPrice(current)

    expect(result.price.value).toBeUndefined()
    expect(result.unitPrice.value).toBeUndefined()
    expect(result.referencePrice.value).toBeUndefined()
    expect(result.tierPrices.value).toEqual([])
    expect(result.displayFrom.value).toBe(false)

    current.value = product({ calculatedPrice: calculatedPrice(12.5, 1) })

    expect(result.unitPrice.value).toBe(12.5)
  })
})
