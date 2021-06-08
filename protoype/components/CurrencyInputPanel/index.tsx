import { USDC, useActiveWeb3React, useUSDCPrice } from '../../../src/hooks'
import styled from 'styled-components'
import { formatNumber } from '../../../src/functions'
import DoubleCurrencyLogo from '../../../src/components/DoubleLogo'
import { darken } from 'polished'
import CurrencyLogo from '../../../src/components/CurrencyLogo'
import { useCurrencyBalance } from '../../../src/state/wallet/hooks'
import { t } from '@lingui/macro'
import { useCallback, useState } from 'react'
import Button from '../../../src/components/Button'
import CurrencySearchModal from '../../../src/components/SearchModal/CurrencySearchModal'
import { useLingui } from '@lingui/react'
import Lottie from 'lottie-react'
import { Currency, Pair } from '@sushiswap/sdk'
import { ChevronDownIcon } from '@heroicons/react/outline'
import { Input as NumericalInput } from '../../../src/components/NumericalInput'
import selectCoinAnimation from '../../../src/animation/select-coin.json'

const CurrencySelect = styled.button<{ selected: boolean }>`
    align-items: center;
    height: 100%;
    font-size: 20px;
    font-weight: 500;
    // background-color: ${({ selected, theme }) =>
        selected ? theme.bg1 : theme.primary1};
    // color: ${({ selected, theme }) =>
        selected ? theme.text1 : theme.white};
    // border-radius: ${({ theme }) => theme.borderRadius};
    // box-shadow: ${({ selected }) =>
        selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)'};
    outline: none;
    cursor: pointer;
    user-select: none;
    border: none;
    // padding: 0 0.5rem;

    :focus,
    :hover {
        // background-color: ${({ selected, theme }) =>
            selected ? theme.bg2 : darken(0.05, theme.primary1)};
    }
`

const StyledTokenName = styled.span<{ active?: boolean }>`
    //   ${({ active }) =>
        active
            ? '  margin: 0 0.25rem 0 0.75rem;'
            : '  margin: 0 0.25rem 0 0.25rem;'}
    //   font-size:  ${({ active }) => (active ? '24px' : '12px')};
`

interface CurrencyInputPanelProps {
    value: string
    onUserInput: (value: string) => void
    onMax?: () => void
    showMaxButton: boolean
    label?: string
    onCurrencySelect?: (currency: Currency) => void
    currency?: Currency | null
    disableCurrencySelect?: boolean
    hideBalance?: boolean
    pair?: Pair | null
    hideInput?: boolean
    otherCurrency?: Currency | null
    id: string
    showCommonBases?: boolean
    customBalanceText?: string
    cornerRadiusBottomNone?: boolean
    cornerRadiusTopNone?: boolean
    containerBackground?: string
}

export default function CurrencyInputPanel({
    value,
    onUserInput,
    onMax,
    showMaxButton,
    label = 'Input',
    onCurrencySelect,
    currency,
    disableCurrencySelect = false,
    hideBalance = false,
    pair = null, // used for double token logo
    hideInput = false,
    otherCurrency,
    id,
    showCommonBases,
    customBalanceText,
    cornerRadiusBottomNone,
    cornerRadiusTopNone,
    containerBackground,
}: CurrencyInputPanelProps) {
    const { i18n } = useLingui()
    const [modalOpen, setModalOpen] = useState(false)
    const { account, chainId } = useActiveWeb3React()
    const selectedCurrencyBalance = useCurrencyBalance(
        account ?? undefined,
        currency ?? undefined
    )

    const handleDismissSearch = useCallback(() => {
        setModalOpen(false)
    }, [setModalOpen])

    const currencyUSDC = useUSDCPrice(currency ? currency : undefined)?.toFixed(
        18
    )
    const valueUSDC = formatNumber(Number(value) * Number(currencyUSDC))

    return (
        <div id={id} className="p-5">
            <div className="flex flex-col gap-3">
                <CurrencySelect
                    selected={!!currency}
                    className="open-currency-select-button"
                    onClick={() => {
                        if (!disableCurrencySelect) {
                            setModalOpen(true)
                        }
                    }}
                >
                    <div className="flex">
                        {pair ? (
                            <DoubleCurrencyLogo
                                currency0={pair.token0}
                                currency1={pair.token1}
                                size={68}
                                margin={true}
                            />
                        ) : currency ? (
                            <div className="flex items-center">
                                <CurrencyLogo currency={currency} size="68px" />
                            </div>
                        ) : (
                            <div
                                className="rounded bg-dark-700"
                                style={{ maxWidth: 68, maxHeight: 68 }}
                            >
                                <div style={{ width: 68, height: 68 }}>
                                    <Lottie
                                        animationData={selectCoinAnimation}
                                        autoplay
                                        loop
                                    />
                                </div>
                            </div>
                        )}
                        {pair ? (
                            <StyledTokenName className="pair-name-container">
                                {pair?.token0.symbol}:{pair?.token1.symbol}
                            </StyledTokenName>
                        ) : (
                            <div className="flex flex-1 flex-col items-start justify-center mx-3.5">
                                {label && (
                                    <div className="text-xs font-medium text-secondary whitespace-nowrap">
                                        {label}
                                    </div>
                                )}
                                <div className="flex items-center">
                                    {/* <StyledTokenName
                                            className="token-symbol-container"
                                            active={Boolean(currency && currency.symbol)}
                                        > */}
                                    <div className="text-high-emphesis text-lg font-bold md:text-2xl">
                                        {(currency &&
                                        currency.symbol &&
                                        currency.symbol.length > 20
                                            ? currency.symbol.slice(0, 4) +
                                              '...' +
                                              currency.symbol.slice(
                                                  currency.symbol.length - 5,
                                                  currency.symbol.length
                                              )
                                            : currency?.getSymbol(chainId)) || (
                                            <div className="px-2 py-1 mt-1 text-xs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap ">
                                                {i18n._(t`Select a token`)}
                                            </div>
                                        )}
                                    </div>
                                    {/* </StyledTokenName> */}
                                    {!disableCurrencySelect && currency && (
                                        <ChevronDownIcon
                                            width={16}
                                            height={16}
                                            className="ml-2 stroke-current"
                                            strokeWidth={5}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </CurrencySelect>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center w-full p-3 px-4 space-x-3 rounded-md bg-dark-1000">
                        {!hideInput && (
                            <>
                                {account &&
                                    currency &&
                                    showMaxButton &&
                                    label !== 'To' && (
                                        <Button
                                            onClick={onMax}
                                            size="small"
                                            className="uppercase py-0.5 px-3 text-xs text-blue border-blue font-medium border rounded-full hover:bg-primary whitespace-nowrap"
                                        >
                                            {i18n._(t`Max`)}
                                        </Button>
                                    )}
                                <NumericalInput
                                    id="token-amount-input"
                                    value={value}
                                    onUserInput={(val) => {
                                        onUserInput(val)
                                    }}
                                />
                                {account && (
                                    <div className="flex flex-col">
                                        {chainId && chainId in USDC && (
                                            <div className="text-xs font-medium text-right text-secondary">
                                                ≈ {valueUSDC} USDC
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div
                        onClick={onMax}
                        className="flex text-xs font-medium text-secondary cursor-pointer gap-2 ml-2"
                    >
                        {!hideBalance && !!currency && selectedCurrencyBalance && (
                            <>
                                <span className="text-high-emphesis font-bold">
                                    {customBalanceText ?? 'Balance: '}
                                </span>
                                <span>
                                    {selectedCurrencyBalance?.toSignificant(6)}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {!disableCurrencySelect && onCurrencySelect && (
                <CurrencySearchModal
                    isOpen={modalOpen}
                    onDismiss={handleDismissSearch}
                    onCurrencySelect={onCurrencySelect}
                    selectedCurrency={currency}
                    otherSelectedCurrency={otherCurrency}
                    showCommonBases={showCommonBases}
                />
            )}
        </div>
    )
}
