import React, { FC } from 'react'
import { usePortfolio } from '../../services/covalent/hooks'
import { useActiveWeb3React } from '../../hooks'
import withAccount, { WithAccountProps } from '../../hoc/withAccount'
import { t } from '@lingui/macro'
import { e10, formatNumber } from '../../functions'
import { i18n } from '@lingui/core'
import ListHeader from '../../components/ListHeader'
import { BigNumber } from 'ethers'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Token, WETH } from '@sushiswap/sdk'
import { useDispatch } from 'react-redux'
import { selectCurrencies } from '../../state/swap/actions'

interface BalancesProps extends WithAccountProps {}

const Balances: FC<BalancesProps> = ({ account }) => {
    const { chainId } = useActiveWeb3React()
    const { data: portfolioData } = usePortfolio({
        chainId,
        address: account,
    })
    const dispatch = useDispatch()
    return (
        <div className="overflow-hidden h-full">
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
                <div className="flex flex-col px-4 py-1">
                    {portfolioData?.items?.reduce(
                        (
                            acc,
                            {
                                holdings,
                                contract_address,
                                contract_ticker_symbol,
                                contract_decimals,
                            }
                        ) => {
                            if (holdings.length === 0) return acc

                            const { quote_rate, close } = holdings[0]
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
                                                            WETH[chainId]
                                                                .address,
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
                                                ? formatNumber(quote_rate, true)
                                                : ''}
                                        </div>
                                        <div className="col-span-3 text-right whitespace-nowrap">
                                            {quote_rate
                                                ? formatNumber(
                                                      +balance * quote_rate,
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
                    )}
                </div>
            </div>
        </div>
    )
}

export default withAccount(Balances)
