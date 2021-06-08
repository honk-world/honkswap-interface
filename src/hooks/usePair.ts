import { Currency, Pair } from '@sushiswap/sdk'
import { PairState, usePairs } from './usePairs'

export function usePair(
    tokenA?: Currency,
    tokenB?: Currency
): [PairState, Pair | null] {
    const ret = usePairs([[tokenA, tokenB]])
    console.log(ret)
    return ret[0]
}
