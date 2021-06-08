import { useLingui } from '@lingui/react'
import { useDerivedSwapInfo } from '../state/swap/hooks'
import { usePair } from '../hooks/usePair'
import { PairState } from '../hooks/usePairs'
import Lottie from 'lottie-react'
import loadingCircle from '../animation/loading-circle.json'
import { t } from '@lingui/macro'
import React from 'react'
import useActiveWeb3React from '../hooks/useActiveWeb3React'
import { WETH, SUSHI_ADDRESS, Token, Pair } from '@sushiswap/sdk'
import { SUSHI } from '../constants'

export interface WithPairProps {
    pair: Pair
    pairState: PairState
}

const withPair =
    (Component) =>
    ({ ...props }) => {
        const { currencies } = useDerivedSwapInfo()
        const { chainId } = useActiveWeb3React()
        const [pairState, pair] = usePair(
            currencies.INPUT || WETH[chainId],
            currencies.OUTPUT ||
                new Token(
                    chainId,
                    SUSHI_ADDRESS[chainId],
                    18,
                    'SUSHI',
                    'SushiToken'
                )
        )

        return <Component pair={pair} pairState={pairState} {...props} />
    }

export default withPair
