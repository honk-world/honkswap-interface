import { useContext, useEffect, useMemo, useState } from 'react'
import { ProContext } from './index'
import useSWR from 'swr'
import { SwapMessageResponse, UserHistoryResponse } from './types'
import { ChainId, Pair } from '@sushiswap/sdk'
import { exchange, vesting } from '../../fetchers/graph'
import { MAX_SUSHI_CLAIMABLE_PER_WEEK } from './constants'

export function usePro() {
    return useContext(ProContext)
}

export function useUserSwapHistory({
    account,
    chainId,
}: {
    account: string
    chainId: ChainId
}) {
    const shouldFetch = account && chainId
    const url = shouldFetch
        ? `https://api.sushipro.io/?api_key=EatSushiIsGood&act=user_transactions&chainID=${chainId}&address=${account.toLowerCase()}`
        : null
    const { data: userHistoryData } = useSWR<UserHistoryResponse, Error>(url)

    return userHistoryData ? userHistoryData.results : []
}

export function useSwapHistory({
    pair,
    chainId,
}: {
    pair: Pair
    chainId: ChainId
}) {
    const shouldFetch = pair && chainId
    const url = shouldFetch
        ? `https://api.sushipro.io/?api_key=EatSushiIsGood&act=last_transactions&chainID=${chainId}&pair=${pair.liquidityToken.address.toLowerCase()}`
        : null
    const { data: swapHistoryData } = useSWR<SwapMessageResponse, Error>(url)

    return swapHistoryData ? swapHistoryData.results : []
}

export function usePairData({
    pair,
    chainId,
    oneDayBlock,
    twoDayBlock,
}: {
    pair: Pair
    chainId: ChainId
    oneDayBlock: number
    twoDayBlock: number
}) {
    const shouldFetch = pair && chainId && oneDayBlock > 0 && twoDayBlock > 0
    const call = useMemo(
        () => [
            chainId,
            `
                query queryData($id: String!, $oneDayBlock: Int!, $twoDayBlock: Int!) {
                    current: pair(id: $id) {
                        id
                        reserveUSD
                        volumeUSD
                        untrackedVolumeUSD
                        txCount
                    }
                    oneDay: pair(id: $id, block: {number: $oneDayBlock}) {
                        id
                        reserveUSD
                        volumeUSD
                        untrackedVolumeUSD
                        txCount
                    }
                    twoDay: pair(id: $id, block: {number: $twoDayBlock}) {
                        id
                        reserveUSD
                        volumeUSD
                        untrackedVolumeUSD
                        txCount
                    }
                }
            `,
            {
                id: pair?.liquidityToken.address.toLowerCase(),
                oneDayBlock,
                twoDayBlock,
            },
        ],
        [chainId, pair?.liquidityToken.address, oneDayBlock, twoDayBlock]
    )

    const { data: pairData } = useSWR(shouldFetch ? call : null, exchange)
    return pairData
}

export function useQuantStats() {
    const [state, setState] = useState({
        lastID: '',
        userCount: 0,
        totalClaimed: 0,
        totalClaimable: 0,
    })

    const call = useMemo(
        () => [
            `
          query manyUsers($lastID: ID) {
            users(first: 1000, where: { id_gt:$lastID }) {
              id
              totalClaimed
            }
            weeks {
              totalClaimed
            }
          }
        `,
            { lastID: state.lastID },
        ],
        [state.lastID]
    )

    const { data } = useSWR(call, vesting)

    useEffect(() => {
        if (!data) return

        const { users, weeks } = data
        setState((prevState) => ({
            lastID:
                users.length > 0
                    ? users[users.length - 1].id
                    : prevState.lastID,
            userCount: prevState.userCount + users.length,
            totalClaimed:
                prevState.totalClaimed +
                users.reduce((acc, el) => acc + +el.totalClaimed, 0),
            totalClaimable: MAX_SUSHI_CLAIMABLE_PER_WEEK.reduce(
                (a, b, i) => (i < weeks.length ? a + b : a),
                0
            ),
        }))
    }, [data])

    return state
}
