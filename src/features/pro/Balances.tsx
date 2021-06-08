import React, { FC } from 'react'
import { usePortfolio } from '../../services/covalent/hooks'
import { useActiveWeb3React } from '../../hooks'
import withAccount, { WithAccountProps } from '../../hoc/withAccount'
import { t } from '@lingui/macro'
import { formatNumber } from '../../functions'
import { i18n } from '@lingui/core'
import ListHeader from '../../components/ListHeader'
import { BigNumber } from 'ethers'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Token, WETH } from '@sushiswap/sdk'
import { useDispatch } from 'react-redux'
import { selectCurrencies } from '../../state/swap/actions'
import loadingCircle from '../../animation/loading-circle.json'
import Lottie from 'lottie-react'

interface BalancesProps extends WithAccountProps {}

const Balances: FC<BalancesProps> = ({ account }) => {
    const { chainId } = useActiveWeb3React()
    const { data: portfolioData } = usePortfolio({
        chainId,
        address: account,
    })
    const dispatch = useDispatch()

    return (
        <div className="overflow-scroll w-full">
            <div className="h-full min-w-[500px]">
                <div className="grid grid-flow-col grid-cols-12 items-center text-secondary gap-2 h-8 px-4 border-b border-dark-850">
                    <ListHeader className="col-span-3">
                        {i18n._(t`Asset`)}
                    </ListHeader>
                    <ListHeader className="col-span-3 justify-end">
                        {i18n._(t`Balance`)}
                    </ListHeader>
                    <ListHeader className="col-span-3 justify-end">
                        {i18n._(t`Price`)}
                    </ListHeader>
                    <ListHeader className="col-span-3 justify-end">
                        {i18n._(t`Value`)}
                    </ListHeader>
                </div>
                <div className="h-[calc(100%-2.5rem)] overflow-auto">
                    <div className="flex flex-col px-4 py-1 h-full">
                        {portfolioData ? (
                            portfolioData.items?.reduce(
                                (
                                    acc,
                                    {
                                        holdings,
                                        contract_address,
                                        contract_ticker_symbol,
                                        contract_decimals,
                                    }
                                ) => {
                                    if (holdings.length <= 2) return acc

                                    const { quote_rate, close } = holdings[1]
                                    const balance = +BigNumber.from(
                                        close.balance
                                    ).toFixed(contract_decimals)

                                    if (balance > 0) {
                                        acc.push(
                                            <div
                                                key={contract_address}
                                                className="grid grid-flow-col grid-cols-12 gap-2 py-1 items-center text-sm font-bold text-high-emphesis"
                                            >
                                                <div
                                                    className="col-span-3 flex items-center cursor-pointer gap-2"
                                                    onClick={() =>
                                                        dispatch(
                                                            selectCurrencies({
                                                                inputCurrencyId:
                                                                    contract_address,
                                                                outputCurrencyId:
                                                                    WETH[
                                                                        chainId
                                                                    ].address,
                                                            })
                                                        )
                                                    }
                                                >
                                                    <CurrencyLogo
                                                        currency={
                                                            new Token(
                                                                chainId,
                                                                contract_address,
                                                                contract_decimals
                                                            )
                                                        }
                                                        squared
                                                    />
                                                    {contract_ticker_symbol}
                                                </div>
                                                <div className="col-span-3 text-right">
                                                    {balance}
                                                </div>
                                                <div className="col-span-3 text-right whitespace-nowrap">
                                                    {quote_rate
                                                        ? formatNumber(
                                                              quote_rate,
                                                              true
                                                          )
                                                        : ''}
                                                </div>
                                                <div className="col-span-3 text-right whitespace-nowrap">
                                                    {quote_rate
                                                        ? formatNumber(
                                                              +balance *
                                                                  quote_rate,
                                                              true
                                                          )
                                                        : ''}
                                                </div>
                                            </div>
                                        )
                                    }

                                    return acc
                                },
                                []
                            )
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
                </div>
            </div>
        </div>
    )
}

export default withAccount(Balances)
