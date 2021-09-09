import { ChainId } from '@mistswapdex/sdk'

// CLASS A

const fetcher = (url: string) =>
  fetch(`${url}${url.endsWith('&') ? '' : '?'}page-size=1000&key=ckey_cba3674f2ce5450f9d5dd29058`)
    .then((res) => res.json())
    .then((data) => data.data)

export const getTokenBalances = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/`)

export const getPortfolio = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/address/${address}/portfolio_v2/`)

export const getTransfers = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/address/${address}/transfers_v2/`)

export const getBlock = (chainId = ChainId.SMARTBCH, blockHeight) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/block_v2/${blockHeight}/`)

export const getBlockHeights = (chainId = ChainId.SMARTBCH, startDate, endDate) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/block_v2/${startDate}/${endDate}/`)

export const getLogs = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/events/address/${address}/`)

export const getLogsForTopic = (chainId = ChainId.SMARTBCH, topic) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/events/topics/${topic}/`)

export const getNftMetadata = (chainId = ChainId.SMARTBCH, address, tokenId) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/${address}/nft_metadata/${tokenId}/`)

export const getNftTokenIds = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/${address}/nft_token_ids/`)

export const getNftTransactions = (chainId = ChainId.SMARTBCH, address, tokenId) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/${address}/nft_transactions/${tokenId}/`)

export const getHoldersChanges = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/${address}/token_holders_changes/`)

export const getTokenHolders = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/${address}/token_holders/`)

export const getTokenMetadata = (chainId = ChainId.SMARTBCH, id) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/tokens/tokenlists/${id}/`)

export const getTransaction = (chainId = ChainId.SMARTBCH, txHash) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/trasaction_v2/${txHash}/`)

export const getChains = () => fetcher(`https://api.covalenthq.com/v1/chains/`)

export const getChainsStatus = () =>
  fetcher(`https://api.covalenthq.com/v1/chains/status/?key=ckey_cba3674f2ce5450f9d5dd290589`)

// TODO: CLASS B
export const getSushiSwapLiquidityTransactions = (chainId = ChainId.SMARTBCH, address) =>
  fetcher(`https://api.covalenthq.com/v1/${chainId}/address/${address}/stacks/sushiswap/acts/`)
