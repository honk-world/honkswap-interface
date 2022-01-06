import { ChainId } from '@honkswapdex/sdk'

const SmartBCH = 'https://raw.githubusercontent.com/honk-world/icons/master/network/smartbch.jpg'
const SmartBCHAmber = 'https://raw.githubusercontent.com/honk-world/icons/master/network/smartbch_amber.jpg'

export const NETWORK_ICON = {
  [ChainId.SMARTBCH]: SmartBCH,
  [ChainId.SMARTBCH_AMBER]: SmartBCHAmber,
}

export const NETWORK_LABEL: { [chainId in ChainId]?: string } = {
  [ChainId.SMARTBCH]: 'smartBCH',
  [ChainId.SMARTBCH_AMBER]: 'Amber Testnet',
}
