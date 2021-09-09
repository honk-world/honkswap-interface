import { ChainId } from '@mistswapdex/sdk'

// Multichain Explorer
const builders = {
  smartscan: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => {
    const prefix = `https://smartscan.cash`
    switch (type) {
      case 'transaction':
        return `${prefix}/tx/${data}`
      default:
        return `${prefix}/${type}/${data}`
    }
  },
}

interface ChainObject {
  [chainId: number]: {
    chainName: string
    builder: (chainName: string, data: string, type: 'transaction' | 'token' | 'address' | 'block') => string
  }
}

const chains: ChainObject = {
  [ChainId.SMARTBCH]: {
    chainName: '',
    builder: builders.smartscan,
  },
  [ChainId.SMARTBCH_AMBER]: {
    chainName: 'amber',
    builder: builders.smartscan,
  },
}

export function getExplorerLink(
  chainId: ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block'
): string {
  const chain = chains[chainId]
  return chain.builder(chain.chainName, data, type)
}
