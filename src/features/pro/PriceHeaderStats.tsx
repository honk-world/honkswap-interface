import React, { FC } from 'react'
import { usePairData, usePro } from '../../context/Pro/hooks'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import { formatNumber, priceFormatter } from '../../functions'
import { OrderDirection } from '../../context/Pro/types'
import Lottie from 'lottie-react'
import loadingCircle from '../../animation/loading-circle.json'
import { useOneDayBlock, useTwoDayBlock } from '../../services/covalent/hooks'
import { useActiveWeb3React } from '../../hooks'
import withPair, { WithPairProps } from '../../hoc/withPair'
import { useTotalSupply } from '../../hooks/useTotalSupply'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ChainId } from '@sushiswap/sdk'
import { PairState } from '../../hooks/usePairs'

interface PriceHeaderStatsProps extends WithPairProps {}

const PriceHeaderStats: FC<PriceHeaderStatsProps> = ({ pair, pairState }) => {
    const { i18n } = useLingui()
    const { chainId } = useActiveWeb3React()
    const oneDayBlock = useOneDayBlock({ chainId })
    const twoDayBlock = useTwoDayBlock({ chainId })
    const pairData = usePairData({ pair, chainId, oneDayBlock, twoDayBlock })
    const totalSupply = useTotalSupply(pair?.token0)
    const [{ lastSwap }] = usePro()

    const volumeUSD = +(pairData?.current?.volumeUSD === '0'
        ? pairData?.current?.untrackedVolumeUSD
        : pairData?.current?.volumeUSD)

    const oneDayVolumeUSD = +(pairData?.oneDay?.volumeUSD === '0'
        ? pairData?.oneDay?.untrackedVolumeUSD
        : pairData?.oneDay?.volumeUSD)

    const twoDayVolumeUSD = +(pairData?.twoDay?.volumeUSD === '0'
        ? pairData?.twoDay?.untrackedVolumeUSD
        : pairData?.twoDay?.volumeUSD)

    const volume = volumeUSD - oneDayVolumeUSD
    const volumeYesterday = oneDayVolumeUSD - twoDayVolumeUSD
    const volumeChange = ((volume - volumeYesterday) / volumeYesterday) * 10
    const fees = volume * 0.003

    return (
        <div className="flex h-full px-4 gap-6 lg:gap-12 text-sm items-center">
            {pairState === PairState.NOT_EXISTS ? (
                <span className="text-xs text-secondary">
                    {i18n._(t`No stats available for this pair`)}
                </span>
            ) : (
                <>
                    {lastSwap ? (
                        <div className="flex flex-col items-baseline">
                            <div className="text-secondary text-xs">
                                {i18n._(t`Last trade price`)}
                            </div>
                            <div
                                className={`text-high-emphesis font-bold flex items-baseline font-mono ${
                                    lastSwap?.side === OrderDirection.BUY
                                        ? 'text-green'
                                        : 'text-red'
                                }`}
                            >
                                {priceFormatter.format(lastSwap?.price)}
                            </div>
                        </div>
                    ) : (
                        <Lottie
                            animationData={loadingCircle}
                            autoplay
                            loop
                            className="w-6 h-6"
                        />
                    )}
                    <div className="hidden md:block">
                        {pairData?.current?.reserveUSD ? (
                            <div className="flex flex-col items-baseline">
                                <div className="text-secondary text-xs">
                                    {i18n._(t`Liquidity`)}
                                </div>
                                <div className="text-high-emphesis font-bold font-mono">
                                    {formatNumber(
                                        pairData.current.reserveUSD,
                                        true
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Lottie
                                animationData={loadingCircle}
                                autoplay
                                loop
                                className="w-6 h-6"
                            />
                        )}
                    </div>

                    {volume ? (
                        <div className="flex flex-col items-baseline">
                            <div className="text-secondary text-xs">
                                {i18n._(t`24h volume`)}
                            </div>
                            <div className="text-high-emphesis font-bold font-mono flex items-baseline gap-1">
                                {formatNumber(volume, true)}
                            </div>
                        </div>
                    ) : (
                        <Lottie
                            animationData={loadingCircle}
                            autoplay
                            loop
                            className="w-6 h-6"
                        />
                    )}
                    <div className="hidden md:block">
                        {fees ? (
                            <div className="flex flex-col items-baseline">
                                <div className="text-secondary text-xs">
                                    {i18n._(t`24h Fees`)}
                                </div>
                                <div className="text-high-emphesis font-bold font-mono">
                                    {formatNumber(fees, true)}
                                </div>
                            </div>
                        ) : (
                            <Lottie
                                animationData={loadingCircle}
                                autoplay
                                loop
                                className="w-6 h-6"
                            />
                        )}
                    </div>
                    <div className="hidden sm:block">
                        {chainId === ChainId.MAINNET &&
                            (totalSupply && lastSwap ? (
                                <div className="flex flex-col items-baseline">
                                    <div className="text-secondary text-xs">
                                        {i18n._(t`Fully diluted market cap`)}
                                    </div>
                                    <div className="text-high-emphesis font-bold font-mono">
                                        <span
                                            className="relative mr-1"
                                            style={{ top: 4 }}
                                        >
                                            <CurrencyLogo
                                                currency={pair.token0}
                                                size={18}
                                            />
                                        </span>
                                        {formatNumber(
                                            +totalSupply.toFixed() *
                                                lastSwap.price,
                                            true
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Lottie
                                    animationData={loadingCircle}
                                    autoplay
                                    loop
                                    className="w-6 h-6"
                                />
                            ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default withPair(PriceHeaderStats)
