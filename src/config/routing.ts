import {
    MIST, XMIST
} from '../config/tokens'
// a list of tokens by chain
import { ChainId, Currency, Token, WNATIVE } from '@mistswapdex/sdk'

type ChainTokenList = {
  readonly [chainId: number]: Token[]
}

// List of all mirror's assets addresses.
// Last pulled from : https://whitelist.mirror.finance/eth/tokenlists.json
// TODO: Generate this programmatically ?
const MIRROR_ADDITIONAL_BASES: { [tokenAddress: string]: Token[] } = {
}

// TODO: SDK should have two maps, WETH map and WNATIVE map.
const WRAPPED_NATIVE_ONLY: ChainTokenList = {
  [ChainId.SMARTBCH]: [WNATIVE[ChainId.SMARTBCH]],
  [ChainId.SMARTBCH_AMBER]: [WNATIVE[ChainId.SMARTBCH_AMBER]],
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  ...WRAPPED_NATIVE_ONLY,
  [ChainId.SMARTBCH]: [...WRAPPED_NATIVE_ONLY[ChainId.SMARTBCH]],
}

export const ADDITIONAL_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] }
} = {
  [ChainId.SMARTBCH]: {
    ...MIRROR_ADDITIONAL_BASES,
  },
}

/**
 * Some tokens can only be swapped via certain pairs, so we override the list of bases that are considered for these
 * tokens.
 */
export const CUSTOM_BASES: {
  [chainId: number]: { [tokenAddress: string]: Token[] }
} = {}

/**
 * Shows up in the currency select for swap and add liquidity
 */
export const COMMON_BASES: ChainTokenList = {
  [ChainId.SMARTBCH]: [...WRAPPED_NATIVE_ONLY[ChainId.SMARTBCH], MIST[ChainId.SMARTBCH]],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  ...WRAPPED_NATIVE_ONLY,
  [ChainId.SMARTBCH]: [...WRAPPED_NATIVE_ONLY[ChainId.SMARTBCH]],
}

export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][]
} = {
  [ChainId.SMARTBCH]: [[MIST[ChainId.SMARTBCH], WNATIVE[ChainId.SMARTBCH]]],
}
