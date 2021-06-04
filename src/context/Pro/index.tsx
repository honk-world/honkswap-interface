import { State } from './types'
import React, { createContext, FC, useMemo, useEffect } from 'react'
import withPair, { WithPairProps } from '../../hoc/withPair'
import withAccount, { WithAccountProps } from '../../hoc/withAccount'
import useWebSocket from 'react-use-websocket'
import { useActiveWeb3React } from '../../hooks'
import { useSwapHistory, useUserSwapHistory } from './hooks'
import { parseWebsocketMessage } from './utils'

export const initialState: State = {
    lastSwap: null,
    userSwapHistory: [],
    swapHistory: [],
}

export const ProContext = createContext<[State, {}]>([initialState, {}])

interface ProviderProps extends WithPairProps, WithAccountProps {
    account: string
}

const Provider: FC<ProviderProps> = ({ children, pair, account }) => {
    const { chainId } = useActiveWeb3React()
    const { sendMessage, lastMessage } = useWebSocket(
        'wss://ws-eu.pusher.com/app/068f5f33d82a69845215'
    )

    const swapHistory = useSwapHistory({ pair, chainId })
    const userSwapHistory = useUserSwapHistory({ account, chainId })

    // TODO Should be per pair in backend to reduce rerenders
    useEffect(() => {
        sendMessage(
            JSON.stringify({
                event: 'pusher:subscribe',
                data: { auth: '', channel: 'live_transactions' },
            })
        )
    }, [])

    useEffect(() => {
        if (!lastMessage) return

        parseWebsocketMessage(pair, swapHistory, lastMessage)
    }, [pair, lastMessage, swapHistory])

    return (
        <ProContext.Provider
            value={useMemo(
                () => [
                    {
                        lastSwap:
                            swapHistory.length > 0 ? swapHistory[0] : null,
                        swapHistory,
                        userSwapHistory,
                    },
                    {},
                ],
                [swapHistory, userSwapHistory]
            )}
        >
            {children}
        </ProContext.Provider>
    )
}

export default withAccount(withPair(Provider))
