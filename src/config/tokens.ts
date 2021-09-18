import { ChainId, MIST_ADDRESS, BAR_ADDRESS, Token, WETH9, WNATIVE } from '@mistswapdex/sdk'

export const FLEXUSD = new Token(ChainId.SMARTBCH, '0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72', 18, 'flexUSD', 'flexUSD')

export const XMIST = new Token(ChainId.SMARTBCH, BAR_ADDRESS[ChainId.SMARTBCH], 18, 'xMIST', 'MistBar')

type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

// MIST
export const MIST: ChainTokenMap = {
  [ChainId.SMARTBCH]: new Token(ChainId.SMARTBCH, MIST_ADDRESS[ChainId.SMARTBCH], 18, 'MIST', 'MistToken'),
  [ChainId.SMARTBCH_AMBER]: new Token(ChainId.SMARTBCH_AMBER, MIST_ADDRESS[ChainId.SMARTBCH_AMBER], 18, 'MIST', 'MistToken'),
}

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
}
