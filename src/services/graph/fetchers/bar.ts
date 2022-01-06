import { ChainId } from '@honkswapdex/sdk'
import { GRAPH_HOST } from '../constants'
import { request } from 'graphql-request'
import { barHistoriesQuery, barQuery } from '../queries/bar'
import { useActiveWeb3React } from '../../../hooks'

const BAR = {
  [ChainId.SMARTBCH]: 'honkswap/bar',
  [ChainId.SMARTBCH_AMBER]: 'honkswap/bar',
}

export const bar = async (query, variables = undefined) => {
  const { chainId } = useActiveWeb3React()

  request(`${GRAPH_HOST[chainId]}/subgraphs/name/${BAR[chainId]}`, query, variables)
}

export const getBar = async (block: number) => {
  const { bar: barData }: any = await bar(barQuery, { block: block ? { number: block } : undefined })
  return barData
}

export const getBarHistory = async () => {
  const { histories }: any = await bar(barHistoriesQuery)
  return histories
}
