import { AddressZero } from '@ethersproject/constants'
import { ChainId } from '@mistswapdex/sdk'

type Currency = { address: string; decimals: number }

// Pricing currency
// TODO: Check decimals and finish table
export const USD_CURRENCY: { [chainId in ChainId]?: Currency } = {
  [ChainId.SMARTBCH]: {
    address: '0x0000000000000000000000000000000000000001',
    decimals: 6,
  },
  [ChainId.SMARTBCH_AMBER]: {
    address: '0x0000000000000000000000000000000000000001',
    decimals: 6,
  },
}

export function getCurrency(chainId: ChainId): Currency {
  return (
    USD_CURRENCY[chainId] || {
      address: AddressZero,
      decimals: 18,
    }
  )
}
