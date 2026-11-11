import { describe, expect, it } from 'vitest'
import { ShopwareApiError } from '../src'

function parsedErrors(response: unknown) {
  return new ShopwareApiError('failed', 400, response).errors
}

const minimalError = {
  status: '400',
  code: 'FRAMEWORK__INVALID_CRITERIA_IDS',
}

describe('ShopwareApiError', () => {
  it('is an Error carrying message, status and raw response', () => {
    const response = { errors: [] }
    const error = new ShopwareApiError('Request failed', 418, response)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ShopwareApiError')
    expect(error.message).toBe('Request failed')
    expect(error.status).toBe(418)
    expect(error.response).toBe(response)
  })

  it('parses a fully populated error payload', () => {
    const error = {
      status: '404',
      code: 'CHECKOUT__CART_LINE_ITEM_NOT_FOUND',
      title: 'Not Found',
      detail: 'Line item not found',
      meta: {
        parameters: {
          identifier: 'abc',
        },
      },
      source: {
        pointer: '/items/0',
      },
      trace: [
        {
          file: '/var/www/src/Core/Checkout/Cart/Cart.php',
          line: 42,
          function: 'remove',
        },
      ],
    }

    expect(parsedErrors({ errors: [error] })).toEqual([error])
  })

  it('accepts errors with only the required fields', () => {
    expect(parsedErrors({ errors: [minimalError] })).toEqual([minimalError])
  })

  it('parses every entry of the errors array', () => {
    const second = {
      ...minimalError,
      code: 'CHECKOUT__CUSTOMER_NOT_LOGGED_IN',
    }

    expect(parsedErrors({ errors: [minimalError, second] })).toEqual([minimalError, second])
  })

  it('strips unknown keys from errors, sources and trace entries', () => {
    const response = {
      errors: [
        {
          ...minimalError,
          extra: 'dropped',
          source: {
            pointer: '/name',
            parameter: 'dropped',
          },
          trace: [
            {
              file: 'Kernel.php',
              line: 1,
              function: 'handle',
              class: 'dropped',
            },
          ],
        },
      ],
    }

    expect(parsedErrors(response)).toStrictEqual([
      {
        ...minimalError,
        source: {
          pointer: '/name',
        },
        trace: [
          {
            file: 'Kernel.php',
            line: 1,
            function: 'handle',
          },
        ],
      },
    ])
  })

  it('accepts meta as an object with arbitrary values', () => {
    const error = {
      ...minimalError,
      meta: {
        parameters: ['a', 'b'],
        count: 2,
        nested: null,
      },
    }

    expect(parsedErrors({ errors: [error] })).toEqual([error])
  })

  it('yields no errors when meta is an array', () => {
    expect(parsedErrors({
      errors: [
        {
          ...minimalError,
          meta: [],
        },
      ],
    })).toEqual([])
  })

  it('yields no errors when status is a number', () => {
    expect(parsedErrors({
      errors: [
        {
          ...minimalError,
          status: 400,
        },
      ],
    })).toEqual([])
  })

  it('yields no errors when a required field is missing', () => {
    expect(parsedErrors({ errors: [{ status: '400' }] })).toEqual([])
  })

  it('yields no errors when a trace entry is malformed', () => {
    expect(parsedErrors({
      errors: [
        {
          ...minimalError,
          trace: [
            {
              file: 'Kernel.php',
              line: '1',
              function: 'handle',
            },
          ],
        },
      ],
    })).toEqual([])
  })

  it('yields no errors when a single entry is invalid', () => {
    expect(parsedErrors({
      errors: [
        minimalError,
        {
          ...minimalError,
          code: 7,
        },
      ],
    })).toEqual([])
  })

  it('yields no errors for responses that are not a Shopware error body', () => {
    expect(parsedErrors(undefined)).toEqual([])
    expect(parsedErrors('Internal Server Error')).toEqual([])
    expect(parsedErrors({})).toEqual([])
    expect(parsedErrors({ errors: 'nope' })).toEqual([])
    expect(parsedErrors({ errors: [] })).toEqual([])
  })
})
