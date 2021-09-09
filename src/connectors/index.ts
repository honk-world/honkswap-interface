import { BscConnector } from '@binance-chain/bsc-connector'
import { ChainId } from '@mistswapdex/sdk'
import { FortmaticConnector } from '../entities/FortmaticConnector'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '../entities/NetworkConnector'
import { PortisConnector } from '@web3-react/portis-connector'
import { TorusConnector } from '@web3-react/torus-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { Web3Provider } from '@ethersproject/providers'

const RPC = {
  [ChainId.SMARTBCH]: 'https://smartbch.fountainhead.cash/mainnet',
  [ChainId.SMARTBCH_AMBER]: 'http://35.220.203.194:8545',
}

export function getNetwork(defaultChainId, urls = RPC) {
  return new NetworkConnector({
    defaultChainId,
    urls,
  })
}

export const network = new NetworkConnector({
  defaultChainId: 10000,
  urls: RPC,
})

let networkLibrary: Web3Provider | undefined

export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [
    10000, // smartbch
    10001, // smartbch-amber
  ],
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: RPC,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 15000,
})

// mainnet only
export const fortmatic = new FortmaticConnector({
  apiKey: process.env.NEXT_PUBLIC_FORTMATIC_API_KEY ?? '',
  chainId: 1,
})

// mainnet only
export const portis = new PortisConnector({
  dAppId: process.env.NEXT_PUBLIC_PORTIS_ID ?? '',
  networks: [1],
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: RPC[ChainId.SMARTBCH],
  appName: 'MistSwap',
  appLogoUrl: 'https://raw.githubusercontent.com/mistswapdex/art/master/sushi/logo-256x256.png',
})

// mainnet only
export const torus = new TorusConnector({
  chainId: 1,
})

// binance only
export const binance = new BscConnector({ supportedChainIds: [56] })
