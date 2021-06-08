import {
    computeTradePriceBreakdown,
    getRouterAddress,
    maxAmountSpend,
    warningSeverity,
} from '../../../src/functions'
import { useAllTokens, useCurrency } from '../../../src/hooks/Tokens'
import {
    useDefaultsFromURLSearch,
    useDerivedSwapInfo,
    useSwapActionHandlers,
    useSwapState,
} from '../../../src/state/swap/hooks'
import {
    ButtonConfirmed,
    ButtonError,
    ButtonLight,
    ButtonPrimary,
} from '../../../src/components/ButtonLegacy'
import {
    ArrowWrapper,
    BottomGrouping,
    SwapCallbackError,
} from '../../../src/features/swap/styleds'
import {
    useExpertModeManager,
    useUserArcherETHTip,
    useUserArcherGasPrice,
    useUserArcherUseRelay,
    useUserSingleHopOnly,
    useUserSlippageTolerance,
    useUserTransactionTTL,
} from '../../../src/state/user/hooks'
import {
    ARCHER_RELAY_URI,
    ARCHER_ROUTER_ADDRESS,
    INITIAL_ALLOWED_SLIPPAGE,
} from '../../../src/constants'
import MinerTip from '../../../src/components/MinerTip'
import { useLingui } from '@lingui/react'
import useWrapCallback, { WrapType } from '../../../src/hooks/useWrapCallback'
import {
    useNetworkModalToggle,
    useToggleSettingsMenu,
    useWalletModalToggle,
} from '../../../src/state/application/hooks'
import AddressInputPanel from '../../../src/components/AddressInputPanel'
import LinkStyledButton from '../../../src/components/LinkStyledButton'
import confirmPriceImpactWithoutFee from '../../../src/features/swap/confirmPriceImpactWithoutFee'
import TradePrice from '../../../src/features/swap/TradePrice'
import { DarkCard, GreyCard } from '../../../src/components/CardLegacy'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AutoRow, RowBetween } from '../../../src/components/Row'
import { ApprovalState, useApproveCallbackFromTrade } from '../../../src/hooks'
import { useActiveWeb3React } from '../../../src/hooks'
import { useSwapCallback } from '../../../src/hooks/useSwapCallback'
import { ArrowDown, Loader } from 'react-feather'
import { useIsTransactionUnsupported } from '../../../src/hooks/Trades'
import Typography from '../../../src/components/Typography'
import UnsupportedCurrencyFooter from '../../../src/features/swap/UnsupportedCurrencyFooter'
import Column, { AutoColumn } from '../../../src/components/Column'
import ProgressSteps from '../../../src/components/ProgressSteps'
import ConfirmSwapModal from '../../../src/features/swap/ConfirmSwapModal'
import useENSAddress from '../../../src/hooks/useENSAddress'
import TokenWarningModal from '../../../src/components/TokenWarningModal'
import { t } from '@lingui/macro'
import { ChainId, CurrencyAmount, JSBI, Token, Trade } from '@sushiswap/sdk'
import { Field } from '../../../src/state/swap/actions'
import ReactGA from 'react-ga'
import AdvancedSwapDetailsDropdown from '../../../src/features/swap/AdvancedSwapDetailsDropdown'
import Lottie from 'lottie-react'
import swapArrowsAnimationData from '../../../src/animation/swap-arrows.json'
import { Text } from 'rebass'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'

export default function SwapContainer() {
    const { i18n } = useLingui()
    const { account, chainId } = useActiveWeb3React()
    const toggleNetworkModal = useNetworkModalToggle()

    // TODO: Use?
    // const router = useRouter()
    // const tokens = router.query.tokens
    // const [currencyIdA, currencyIdB] = tokens as string[]
    // const currencyA = useCurrency(currencyIdA)
    // const currencyB = useCurrency(currencyIdB)

    const loadedUrlParams = useDefaultsFromURLSearch()

    // token warning stuff
    const [loadedInputCurrency, loadedOutputCurrency] = [
        useCurrency(loadedUrlParams?.inputCurrencyId),
        useCurrency(loadedUrlParams?.outputCurrencyId),
    ]
    const [dismissTokenWarning, setDismissTokenWarning] =
        useState<boolean>(false)
    const urlLoadedTokens: Token[] = useMemo(
        () =>
            [loadedInputCurrency, loadedOutputCurrency]?.filter(
                (c): c is Token => c instanceof Token
            ) ?? [],
        [loadedInputCurrency, loadedOutputCurrency]
    )
    const handleConfirmTokenWarning = useCallback(() => {
        setDismissTokenWarning(true)
    }, [])

    // dismiss warning if all imported tokens are in active lists
    const defaultTokens = useAllTokens()
    const importTokensNotInDefault =
        urlLoadedTokens &&
        urlLoadedTokens.filter((token: Token) => {
            return !Boolean(token.address in defaultTokens)
        })

    // toggle wallet when disconnected
    const toggleWalletModal = useWalletModalToggle()

    // for expert mode
    const toggleSettings = useToggleSettingsMenu()
    const [isExpertMode] = useExpertModeManager()

    // get custom setting values for user
    const [allowedSlippage] = useUserSlippageTolerance()
    const [ttl] = useUserTransactionTTL()
    const [useArcher] = useUserArcherUseRelay()
    const [archerETHTip] = useUserArcherETHTip()
    const [archerGasPrice] = useUserArcherGasPrice()

    // archer
    const archerRelay = chainId ? ARCHER_RELAY_URI?.[chainId] : undefined
    const doArcher = archerRelay !== undefined && useArcher

    // swap state
    const { independentField, typedValue, recipient } = useSwapState()
    const {
        v2Trade,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError: swapInputError,
    } = useDerivedSwapInfo(doArcher)
    const {
        wrapType,
        execute: onWrap,
        inputError: wrapInputError,
    } = useWrapCallback(
        currencies[Field.INPUT],
        currencies[Field.OUTPUT],
        typedValue
    )
    const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
    const { address: recipientAddress } = useENSAddress(recipient)

    const trade = showWrap ? undefined : v2Trade

    const parsedAmounts = showWrap
        ? {
              [Field.INPUT]: parsedAmount,
              [Field.OUTPUT]: parsedAmount,
          }
        : {
              [Field.INPUT]:
                  independentField === Field.INPUT
                      ? parsedAmount
                      : trade?.inputAmount,
              [Field.OUTPUT]:
                  independentField === Field.OUTPUT
                      ? parsedAmount
                      : trade?.outputAmount,
          }

    const {
        onSwitchTokens,
        onCurrencySelection,
        onUserInput,
        onChangeRecipient,
    } = useSwapActionHandlers()
    const isValid = !swapInputError
    const dependentField: Field =
        independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

    const handleTypeInput = useCallback(
        (value: string) => {
            onUserInput(Field.INPUT, value)
        },
        [onUserInput]
    )
    const handleTypeOutput = useCallback(
        (value: string) => {
            onUserInput(Field.OUTPUT, value)
        },
        [onUserInput]
    )

    // modal and loading
    const [
        {
            showConfirm,
            tradeToConfirm,
            swapErrorMessage,
            attemptingTxn,
            txHash,
        },
        setSwapState,
    ] = useState<{
        showConfirm: boolean
        tradeToConfirm: Trade | undefined
        attemptingTxn: boolean
        swapErrorMessage: string | undefined
        txHash: string | undefined
    }>({
        showConfirm: false,
        tradeToConfirm: undefined,
        attemptingTxn: false,
        swapErrorMessage: undefined,
        txHash: undefined,
    })

    const formattedAmounts = {
        [independentField]: typedValue,
        [dependentField]: showWrap
            ? parsedAmounts[independentField]?.toExact() ?? ''
            : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }

    const route = trade?.route
    const userHasSpecifiedInputOutput = Boolean(
        currencies[Field.INPUT] &&
            currencies[Field.OUTPUT] &&
            parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
    )
    const noRoute = !route

    // check whether the user has approved the router on the input token
    const [approval, approveCallback] = useApproveCallbackFromTrade(
        doArcher
            ? ARCHER_ROUTER_ADDRESS[chainId ?? 1]
            : getRouterAddress(chainId),
        trade,
        allowedSlippage
    )

    // check if user has gone through approval process, used to show two step buttons, reset on token change
    const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

    // mark when a user has submitted an approval, reset onTokenSelection for input field
    useEffect(() => {
        if (approval === ApprovalState.PENDING) {
            setApprovalSubmitted(true)
        }
    }, [approval, approvalSubmitted])

    const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(
        currencyBalances[Field.INPUT],
        doArcher ? archerETHTip : undefined,
        chainId
    )
    const atMaxAmountInput = Boolean(
        maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput)
    )

    // the callback to execute the swap
    const { callback: swapCallback, error: swapCallbackError } =
        useSwapCallback(
            trade,
            allowedSlippage,
            recipient,
            doArcher ? ttl : undefined
        )

    const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

    const [singleHopOnly] = useUserSingleHopOnly()

    const handleSwap = useCallback(() => {
        if (
            priceImpactWithoutFee &&
            !confirmPriceImpactWithoutFee(priceImpactWithoutFee)
        ) {
            return
        }
        if (!swapCallback) {
            return
        }
        setSwapState({
            attemptingTxn: true,
            tradeToConfirm,
            showConfirm,
            swapErrorMessage: undefined,
            txHash: undefined,
        })
        swapCallback()
            .then((hash) => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: undefined,
                    txHash: hash,
                })

                ReactGA.event({
                    category: 'Swap',
                    action:
                        recipient === null
                            ? 'Swap w/o Send'
                            : (recipientAddress ?? recipient) === account
                            ? 'Swap w/o Send + recipient'
                            : 'Swap w/ Send',
                    label: [
                        trade?.inputAmount?.currency?.getSymbol(chainId),
                        trade?.outputAmount?.currency?.getSymbol(chainId),
                    ].join('/'),
                })

                ReactGA.event({
                    category: 'Routing',
                    action: singleHopOnly
                        ? 'Swap with multihop disabled'
                        : 'Swap with multihop enabled',
                })
            })
            .catch((error) => {
                setSwapState({
                    attemptingTxn: false,
                    tradeToConfirm,
                    showConfirm,
                    swapErrorMessage: error.message,
                    txHash: undefined,
                })
            })
    }, [
        priceImpactWithoutFee,
        swapCallback,
        tradeToConfirm,
        showConfirm,
        recipient,
        recipientAddress,
        account,
        trade,
        chainId,
        singleHopOnly,
    ])

    // errors
    const [showInverted, setShowInverted] = useState<boolean>(false)

    // warnings on slippage
    const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

    // show approve flow when: no error on inputs, not approved or pending, or approved in current session
    // never show if price impact is above threshold in non expert mode
    const showApproveFlow =
        !swapInputError &&
        (approval === ApprovalState.NOT_APPROVED ||
            approval === ApprovalState.PENDING ||
            (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
        !(priceImpactSeverity > 3 && !isExpertMode)

    const handleConfirmDismiss = useCallback(() => {
        setSwapState({
            showConfirm: false,
            tradeToConfirm,
            attemptingTxn,
            swapErrorMessage,
            txHash,
        })
        // if there was a tx hash, we want to clear the input
        if (txHash) {
            onUserInput(Field.INPUT, '')
        }
    }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

    const handleAcceptChanges = useCallback(() => {
        setSwapState({
            tradeToConfirm: trade,
            swapErrorMessage,
            txHash,
            attemptingTxn,
            showConfirm,
        })
    }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

    const handleInputSelect = useCallback(
        (inputCurrency) => {
            setApprovalSubmitted(false) // reset 2 step UI for approvals
            onCurrencySelection(Field.INPUT, inputCurrency)
        },
        [onCurrencySelection]
    )

    const handleMaxInput = useCallback(() => {
        maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
    }, [maxAmountInput, onUserInput])

    const handleOutputSelect = useCallback(
        (outputCurrency) => onCurrencySelection(Field.OUTPUT, outputCurrency),
        [onCurrencySelection]
    )

    useEffect(() => {
        if (
            doArcher &&
            parsedAmounts[Field.INPUT] &&
            maxAmountInput &&
            parsedAmounts[Field.INPUT]?.greaterThan(maxAmountInput)
        ) {
            handleMaxInput()
        }
    }, [handleMaxInput, parsedAmounts, maxAmountInput, doArcher])

    const swapIsUnsupported = useIsTransactionUnsupported(
        currencies?.INPUT,
        currencies?.OUTPUT
    )

    const [animateSwapArrows, setAnimateSwapArrows] = useState<boolean>(false)

    return (
        <>
            <TokenWarningModal
                isOpen={
                    importTokensNotInDefault.length > 0 && !dismissTokenWarning
                }
                tokens={importTokensNotInDefault}
                onConfirm={handleConfirmTokenWarning}
            />
            <div id="swap-page">
                <ConfirmSwapModal
                    isOpen={showConfirm}
                    trade={trade}
                    originalTrade={tradeToConfirm}
                    onAcceptChanges={handleAcceptChanges}
                    attemptingTxn={attemptingTxn}
                    txHash={txHash}
                    recipient={recipient}
                    allowedSlippage={allowedSlippage}
                    onConfirm={handleSwap}
                    swapErrorMessage={swapErrorMessage}
                    onDismiss={handleConfirmDismiss}
                    archerETHTip={doArcher ? archerETHTip : undefined}
                />
                <div>
                    <CurrencyInputPanel
                        label={
                            independentField === Field.OUTPUT &&
                            !showWrap &&
                            trade
                                ? i18n._(t`Swap From (est.):`)
                                : i18n._(t`Swap From:`)
                        }
                        value={formattedAmounts[Field.INPUT]}
                        showMaxButton={!atMaxAmountInput}
                        currency={currencies[Field.INPUT]}
                        onUserInput={handleTypeInput}
                        onMax={handleMaxInput}
                        onCurrencySelect={handleInputSelect}
                        otherCurrency={currencies[Field.OUTPUT]}
                        id="swap-currency-input"
                    />
                    <AutoColumn justify="space-between" className="py-5">
                        <AutoRow
                            justify={
                                isExpertMode ? 'space-between' : 'flex-start'
                            }
                            style={{ padding: '0 1rem' }}
                        >
                            <button
                                className="z-10 -mt-6 -mb-6 rounded-full bg-dark-900 p-3px"
                                onClick={() => {
                                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                                    onSwitchTokens()
                                }}
                            >
                                <div
                                    className="p-2 rounded-full bg-dark-800 hover:bg-dark-700 border-2 border-dark-800"
                                    onMouseEnter={() =>
                                        setAnimateSwapArrows(true)
                                    }
                                    onMouseLeave={() =>
                                        setAnimateSwapArrows(false)
                                    }
                                >
                                    <Lottie
                                        animationData={swapArrowsAnimationData}
                                        autoplay={animateSwapArrows}
                                        loop={false}
                                        style={{ width: 32, height: 32 }}

                                        // className="fill-current text-secondary"
                                    />
                                </div>
                            </button>
                            {/* <ArrowWrapper clickable>
                                      <ArrowDown
                                        size="16"
                                        onClick={() => {
                                            setApprovalSubmitted(false) // reset 2 step UI for approvals
                                            onSwitchTokens()
                                        }}
                                        color={
                                            currencies[Field.INPUT] && currencies[Field.OUTPUT]
                                                ? theme.primary1
                                                : theme.text2
                                        }
                                    />
                                </ArrowWrapper> */}
                            {recipient === null && !showWrap && isExpertMode ? (
                                <LinkStyledButton
                                    id="add-recipient-button"
                                    onClick={() => onChangeRecipient('')}
                                >
                                    + Add a send (optional)
                                </LinkStyledButton>
                            ) : null}
                        </AutoRow>
                    </AutoColumn>

                    <div className="bg-dark-800 -mt-6 pt-6 relative">
                        <CurrencyInputPanel
                            value={formattedAmounts[Field.OUTPUT]}
                            onUserInput={handleTypeOutput}
                            label={
                                independentField === Field.INPUT &&
                                !showWrap &&
                                trade
                                    ? i18n._(t`Swap To (est.):`)
                                    : i18n._(t`Swap To:`)
                            }
                            showMaxButton={false}
                            currency={currencies[Field.OUTPUT]}
                            onCurrencySelect={handleOutputSelect}
                            otherCurrency={currencies[Field.INPUT]}
                            id="swap-currency-output"
                        />

                        {Boolean(trade) && (
                            <TradePrice
                                price={trade?.executionPrice}
                                showInverted={showInverted}
                                setShowInverted={setShowInverted}
                            />
                        )}

                        {recipient !== null && !showWrap ? (
                            <>
                                <AutoRow
                                    justify="space-between"
                                    style={{ padding: '0 1rem' }}
                                >
                                    <ArrowWrapper clickable={false}>
                                        <ArrowDown size={16} />
                                    </ArrowWrapper>
                                    <LinkStyledButton
                                        id="remove-recipient-button"
                                        onClick={() => onChangeRecipient(null)}
                                    >
                                        - {i18n._(t`Remove send`)}
                                    </LinkStyledButton>
                                </AutoRow>
                                <AddressInputPanel
                                    id="recipient"
                                    value={recipient}
                                    onChange={onChangeRecipient}
                                />
                            </>
                        ) : null}

                        {showWrap ? null : (
                            <div
                                style={{
                                    padding: showWrap
                                        ? '.25rem 1rem 0 1rem'
                                        : '0px',
                                }}
                            >
                                <div className="px-5 mt-4 space-y-2">
                                    {allowedSlippage !==
                                        INITIAL_ALLOWED_SLIPPAGE && (
                                        <RowBetween align="center">
                                            <Typography
                                                variant="caption2"
                                                className="text-secondary"
                                                onClick={toggleSettings}
                                            >
                                                {i18n._(t`Slippage Tolerance`)}
                                            </Typography>

                                            <Typography
                                                variant="caption2"
                                                className="text-secondary"
                                                onClick={toggleSettings}
                                            >
                                                {allowedSlippage / 100}%
                                            </Typography>
                                        </RowBetween>
                                    )}
                                </div>
                                <div className="px-5 mt-1">
                                    {doArcher &&
                                        userHasSpecifiedInputOutput && (
                                            <MinerTip />
                                        )}
                                </div>
                            </div>
                        )}

                        {swapIsUnsupported ? (
                            <ButtonPrimary disabled={true}>
                                <div>{i18n._(t`Unsupported Asset`)}</div>
                            </ButtonPrimary>
                        ) : !account ? (
                            <ButtonLight onClick={toggleWalletModal}>
                                {i18n._(t`Connect Wallet`)}
                            </ButtonLight>
                        ) : showWrap ? (
                            <ButtonPrimary
                                disabled={Boolean(wrapInputError)}
                                onClick={onWrap}
                            >
                                {wrapInputError ??
                                    (wrapType === WrapType.WRAP
                                        ? i18n._(t`Wrap`)
                                        : wrapType === WrapType.UNWRAP
                                        ? i18n._(t`Unwrap`)
                                        : null)}
                            </ButtonPrimary>
                        ) : noRoute && userHasSpecifiedInputOutput ? (
                            <GreyCard style={{ textAlign: 'center' }}>
                                <div className="mb-1">
                                    {i18n._(
                                        t`Insufficient liquidity for this trade`
                                    )}
                                </div>
                                {singleHopOnly && (
                                    <div className="mb-1">
                                        {i18n._(
                                            t`Try enabling multi-hop trades`
                                        )}
                                    </div>
                                )}
                            </GreyCard>
                        ) : showApproveFlow ? (
                            <RowBetween>
                                <ButtonConfirmed
                                    onClick={approveCallback}
                                    disabled={
                                        approval !==
                                            ApprovalState.NOT_APPROVED ||
                                        approvalSubmitted
                                    }
                                    width="100%"
                                    altDisabledStyle={
                                        approval === ApprovalState.PENDING
                                    } // show solid button while waiting
                                    confirmed={
                                        approval === ApprovalState.APPROVED
                                    }
                                >
                                    {approval === ApprovalState.PENDING ? (
                                        <AutoRow gap="6px" justify="center">
                                            Approving <Loader stroke="white" />
                                        </AutoRow>
                                    ) : approvalSubmitted &&
                                      approval === ApprovalState.APPROVED ? (
                                        i18n._(t`Approved`)
                                    ) : (
                                        i18n._(
                                            t`Approve ${currencies[
                                                Field.INPUT
                                            ]?.getSymbol(chainId)}`
                                        )
                                    )}
                                </ButtonConfirmed>
                                {approval === ApprovalState.APPROVED && (
                                    <ButtonError
                                        onClick={() => {
                                            if (isExpertMode) {
                                                handleSwap()
                                            } else {
                                                setSwapState({
                                                    tradeToConfirm: trade,
                                                    attemptingTxn: false,
                                                    swapErrorMessage: undefined,
                                                    showConfirm: true,
                                                    txHash: undefined,
                                                })
                                            }
                                        }}
                                        width="100%"
                                        id="swap-button"
                                        disabled={
                                            !isValid ||
                                            approval !==
                                                ApprovalState.APPROVED ||
                                            (priceImpactSeverity > 3 &&
                                                !isExpertMode)
                                        }
                                        error={
                                            isValid && priceImpactSeverity > 2
                                        }
                                    >
                                        <Text className="font-medium">
                                            {priceImpactSeverity > 3 &&
                                            !isExpertMode
                                                ? i18n._(t`Price Impact High`)
                                                : priceImpactSeverity > 2
                                                ? i18n._(t`Swap Anyway`)
                                                : i18n._(t`Swap`)}
                                        </Text>
                                    </ButtonError>
                                )}
                            </RowBetween>
                        ) : (
                            <ButtonError
                                onClick={() => {
                                    if (isExpertMode) {
                                        handleSwap()
                                    } else {
                                        setSwapState({
                                            tradeToConfirm: trade,
                                            attemptingTxn: false,
                                            swapErrorMessage: undefined,
                                            showConfirm: true,
                                            txHash: undefined,
                                        })
                                    }
                                }}
                                id="swap-button"
                                disabled={
                                    !isValid ||
                                    (priceImpactSeverity > 3 &&
                                        !isExpertMode) ||
                                    !!swapCallbackError
                                }
                                error={
                                    isValid &&
                                    priceImpactSeverity > 2 &&
                                    !swapCallbackError
                                }
                            >
                                <Text fontSize={20} fontWeight={500}>
                                    {swapInputError
                                        ? swapInputError
                                        : priceImpactSeverity > 3 &&
                                          !isExpertMode
                                        ? i18n._(t`Price Impact Too High`)
                                        : priceImpactSeverity > 2
                                        ? i18n._(t`Swap Anyway`)
                                        : i18n._(t`Swap`)}
                                </Text>
                            </ButtonError>
                        )}
                        {showApproveFlow && (
                            <Column style={{ marginTop: '1rem' }}>
                                <ProgressSteps
                                    steps={[
                                        approval === ApprovalState.APPROVED,
                                    ]}
                                />
                            </Column>
                        )}
                        {isExpertMode && swapErrorMessage ? (
                            <SwapCallbackError error={swapErrorMessage} />
                        ) : null}
                    </div>
                </div>
            </div>
            {!swapIsUnsupported ? (
                <AdvancedSwapDetailsDropdown trade={trade} />
            ) : (
                <UnsupportedCurrencyFooter
                    show={swapIsUnsupported}
                    currencies={[currencies.INPUT, currencies.OUTPUT]}
                />
            )}
        </>
    )
}
