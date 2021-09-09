import { ChainId, MIST_ADDRESS, Token, WETH9, WNATIVE } from '@mistswapdex/sdk'

export const XMIST = new Token(ChainId.SMARTBCH, '0x0000000000000000000000000000000000000000', 18, 'xMIST', 'MistBar')

type ChainTokenMap = {
  readonly [chainId in ChainId]?: Token
}

// MIST
export const MIST: ChainTokenMap = {
  [ChainId.SMARTBCH]: new Token(ChainId.SMARTBCH, MIST_ADDRESS[ChainId.SMARTBCH], 18, 'MIST', 'MistToken'),
}

export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
}
