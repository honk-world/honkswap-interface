import React, { FC } from 'react'
import { t } from '@lingui/macro'
import { amountFormatter, priceFormatter } from '../../functions'
import { useLingui } from '@lingui/react'
import withPair, { WithPairProps } from '../../hoc/withPair'
import { usePro } from '../../context/Pro/hooks'
import { OrderDirection } from '../../context/Pro/types'
import ListHeader from '../../components/ListHeader'
import loadingCircle from '../../animation/loading-circle.json'
import Lottie from 'lottie-react'
import { PairState } from '../../hooks/usePairs'

interface SwapHistoryProps extends WithPairProps {}

const SwapHistory: FC<SwapHistoryProps> = ({ pair, pairState }) => {
    const { i18n } = useLingui()
    const [{ swapHistory }] = usePro()

    return (
        <div className="overflow-hidden h-full">
            <div className="grid grid-flow-col grid-cols-12 items-center text-secondary gap-2 h-8 px-4 border-b border-dark-850">
                <ListHeader className="col-span-4 justify-end">
                    {i18n._(t`Size`)}{' '}
                    {pair && (
                        <span className="font-bold text-secondary text-[.625rem] bg-dark-800 rounded px-1 py-0.5">
                            {pair?.token0.symbol}
                        </span>
                    )}
                </ListHeader>
                <ListHeader className="col-span-4 justify-end">
                    {i18n._(t`Price`)}{' '}
                    <span className="font-bold text-secondary text-[.625rem] bg-dark-800 rounded px-1 py-0.5">
                        USD
                    </span>
                </ListHeader>
                <ListHeader className="col-span-4 justify-end">
                    {i18n._(t`Time`)}
                </ListHeader>
            </div>
            {pair ? (
                <div className="h-[calc(100%-2.5rem)] overflow-auto">
                    <div className="flex flex-col px-4 py-1">
                        {swapHistory.map(
                            (
                                {
                                    chainId,
                                    amountBase,
                                    side,
                                    timestamp,
                                    price,
                                    txHash,
                                },
                                index
                            ) => {
                                const buy = side === OrderDirection.BUY
                                return (
                                    <div
                                        key={`${txHash}-${index}`}
                                        className="grid grid-flow-col grid-cols-12 text-xs gap-2 items-center h-[20px] font-mono"
                                    >
                                        <div
                                            className={`text-right col-span-4 ${
                                                buy ? 'text-green' : 'text-red'
                                            }`}
                                        >
                                            {amountFormatter.format(amountBase)}
                                        </div>
                                        <div className="col-span-4 font-mono text-right">
                                            {priceFormatter.format(price)}
                                        </div>
                                        <div className="col-span-4 text-right text-secondary font-mono whitespace-nowrap">
                                            {new Date(
                                                timestamp * 1000
                                            ).toLocaleTimeString()}
                                        </div>
                                    </div>
                                )
                            }
                        )}
                    </div>
                </div>
            ) : pairState === PairState.NOT_EXISTS ? (
                <span className="h-[calc(100%-2.5rem)] w-full flex items-center justify-center text-xs text-secondary">
                    {i18n._(t`No swaps available for this pair`)}
                </span>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Lottie
                        animationData={loadingCircle}
                        autoplay
                        loop
                        className="w-6 h-6"
                    />
                </div>
            )}
        </div>
    )
}

export default withPair(SwapHistory)
