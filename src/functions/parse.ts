import { Currency, CurrencyAmount, JSBI } from '@mistswapdex/sdk'

import { parseUnits } from '@ethersproject/units'

export function parseBalance(value: string, decimals = 18) {
  return parseUnits(value || '0', decimals)
}

// try to parse a user entered amount for a given token
export function tryParseAmount<T extends Currency>(value?: string, currency?: T): CurrencyAmount<T> | undefined {
  if (!value) {
    value = "0"
  }
  if (!currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString()
    return CurrencyAmount.fromRawAmount(currency, JSBI.BigInt(typedValueParsed))
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}
