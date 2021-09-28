import { AddressZero } from '@ethersproject/constants'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, JSBI } from '@mistswapdex/sdk'
import { useSushiRollContract } from '../../hooks/useContract'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useState } from 'react'
import { ChevronRight } from 'react-feather'
import styled from 'styled-components'
import Button from '../../components/Button'
import { ButtonConfirmed } from '../../components/Button'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import Input from '../../components/Input'
import QuestionHelper from '../../components/QuestionHelper'
import Dots from '../../components/Dots'
import { useActiveWeb3React } from '../../hooks'
import { tryParseAmount } from '../../functions/parse'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useMigrateState, { MigrateState } from '../../hooks/useMigrateState'
import CloseIcon from '../../components/CloseIcon';
import LPToken from '../../types/LPToken'
import MetamaskError from '../../types/MetamaskError'
import Head from 'next/head'
import Image from 'next/image'
import Typography from '../../components/Typography'
import Badge from '../../components/Badge'
import Container from '../../components/Container'
import { AutoColumn } from '../../components/Column'

const ZERO = JSBI.BigInt(0)

const StyledNumericalInput = styled(Input.Numeric)`
  caret-color: #e3e3e3;
`

const AmountInput = ({ state }: { state: MigrateState }) => {
    const { i18n } = useLingui()
    const onPressMax = useCallback(() => {
        if (state.selectedLPToken) {
            const bal = state.selectedLPToken.balance as CurrencyAmount<Token>
            if (state.selectedLPToken.address === AddressZero) {
                // Subtract 0.01 ETH for gas fee
                const fee = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16))
                bal = bal.greaterThan(fee) ? bal.subtract(fee) : ZERO
            }

            state.setAmount(bal.toFixed())
        }
    }, [state])

    useEffect(() => {
        if (!state.mode || state.lpTokens.length === 0 || !state.selectedLPToken) {
            state.setAmount('')
        }
    }, [state])

    if (!state.mode || state.lpTokens.length === 0 || !state.selectedLPToken) {
        return null
    }

    const input = state.amount ? state.amount : ''

    const formattedBalance = state.selectedLPToken.balance.toSignificant(4)

    const parsedAmount = tryParseAmount(input, state.selectedLPToken)

    const insufficientAmount = (input && input === '0') || parsedAmount && parsedAmount.greaterThan(state.selectedLPToken.balance)
    const inputError = insufficientAmount

    return (
        <>
            <Typography variant="caption" className="text-secondary">
                Amount of Tokens
            </Typography>

            <div className="flex items-center relative w-full mb-4">
              <div className="w-full">
                <StyledNumericalInput
                  value={input}
                  onUserInput={val => state.setAmount(val)}
                  className={`w-full h-14 px-3 md:px-5 mt-5 rounded bg-dark-800 text-sm md:text-lg font-bold text-dark-800 whitespace-nowrap${
                    inputError ? ' pl-9 md:pl-12' : ''
                  }`}
                  placeholder=" "
                />
                {/* input overlay: */}
                <div className="relative w-full h-0 pointer-events-none bottom-14">
                  <div
                    className={`flex justify-between items-center h-14 rounded px-3 md:px-5 ${
                      inputError ? ' border border-red' : ''
                    }`}
                  >
                    <div className="flex space-x-2 ">
                      {inputError && (
                        <Image
                          className="mr-2 max-w-4 md:max-w-5"
                          src="/error-triangle.svg"
                          alt="error"
                          width="20px"
                          height="20px"
                        />
                      )}
                      <p
                        className={`text-sm md:text-lg font-bold whitespace-nowrap ${
                          input ? 'text-high-emphesis' : 'text-secondary'
                        }`}
                      >
                        {`${input ? input : '0'} LP`}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-secondary md:text-base">
                      <div className={input ? 'hidden md:flex md:items-center' : 'flex items-center'}>
                        <p>{i18n._(t`Balance`)}:&nbsp;</p>
                        <p className="text-base font-bold">{formattedBalance}</p>
                      </div>
                      <button
                        className="px-2 py-1 ml-3 text-xs font-bold border pointer-events-auto focus:outline-none focus:ring hover:bg-opacity-40 md:bg-cyan-blue md:bg-opacity-30 border-secondary md:border-cyan-blue rounded-2xl md:py-1 md:px-3 md:ml-4 md:text-sm md:font-normal md:text-cyan-blue"
                        onClick={onPressMax}
                      >
                        {i18n._(t`MAX`)}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </>
    )
}

interface PositionCardProps {
    lpToken: LPToken
    onToggle: (lpToken: LPToken) => void
    isSelected: boolean
    updating: boolean
    exchange: string | undefined
}

const LPTokenSelect = ({ lpToken, onToggle, isSelected, updating, exchange }: PositionCardProps) => {
    return (
        <div
            key={lpToken.address}
            className="cursor-pointer flex justify-between items-center rounded px-3 py-5 bg-dark-800 hover:bg-dark-700"
            onClick={() => onToggle(lpToken)}
        >
            <div className="flex items-center space-x-3">
                <DoubleCurrencyLogo currency0={lpToken.tokenA} currency1={lpToken.tokenB} size={20} />
                <Typography
                    variant="body"
                    className="text-primary"
                >{`${lpToken.tokenA.symbol}/${lpToken.tokenB.symbol}`}</Typography>
                {lpToken.version && <Badge color="pink">{lpToken.version}</Badge>}
            </div>
            {isSelected ? <CloseIcon /> : <ChevronRight />}
        </div>
    )
}

const MigrateModeSelect = ({ state }: { state: MigrateState }) => {
    function toggleMode(mode = undefined) {
        state.setMode(mode !== state.mode ? mode : undefined)
    }

    const items = [
        {
            key: 'permit',
            text: 'Non-hardware Wallet',
            description: 'Migration is done in one-click using your signature (permit)'
        },
        {
            key: 'approve',
            text: 'Hardware Wallet',
            description: 'You need to first approve LP tokens and then migrate it'
        }
    ]

    return (
        <>
            {items.reduce((acc: any, { key, text, description }: any) => {
                if (state.mode === undefined || key === state.mode)
                    acc.push(
                        <div
                            key={key}
                            className="cursor-pointer flex justify-between items-center rounded p-3 bg-dark-800 hover:bg-dark-700"
                            onClick={() => toggleMode(key)}
                        >
                            <div>
                                <div>
                                    <Typography variant="caption">{text}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption2" className="text-secondary">
                                        {description}
                                    </Typography>
                                </div>
                            </div>
                            {key === state.mode ? <CloseIcon /> : <ChevronRight />}
                        </div>
                    )
                return acc
            }, [])}
        </>
    )
}

const MigrateButtons = ({ state, exchange }: { state: MigrateState; exchange: string | undefined }) => {
    const [error, setError] = useState<MetamaskError>({})
    const sushiRollContract = useSushiRollContract(
        state.selectedLPToken?.version ? state.selectedLPToken?.version : undefined
    )

    const [approval, approve] = useApproveCallback(state.selectedLPToken?.balance, sushiRollContract?.address)
    const noLiquidityTokens = !!state.selectedLPToken?.balance && state.selectedLPToken?.balance.equalTo(ZERO)
    const isButtonDisabled = !state.amount

    useEffect(() => {
        setError({})
    }, [state.selectedLPToken])

    if (!state.mode || state.lpTokens.length === 0 || !state.selectedLPToken) {
        return <span />
    }

    const input = state.amount ? state.amount : ''

    const formattedBalance = state.selectedLPToken.balance.toSignificant(4)

    const parsedAmount = tryParseAmount(input, state.selectedLPToken)

    const insufficientAmount = parsedAmount && parsedAmount.greaterThan(state.selectedLPToken.balance)
    const inputError = insufficientAmount

    const onPress = async () => {
        setError({})
        try {
            await state.onMigrate()
        } catch (e) {
            console.log(e)
            setError(e)
        }
    }

    return (
        <div className="space-y-4">
            {insufficientAmount ? (
                <div className="text-sm text-primary">Insufficient Balance</div>
            ) : state.loading ? (
                <Dots>Loading</Dots>
            ) : (
                <>
                    <div className="flex justify-between">
                        <div className="text-sm text-secondary">
                            Balance:{' '}
                            <span className="text-primary">{formattedBalance}</span>
                        </div>
                    </div>
                    {state.mode === 'approve' && (
                        <ButtonConfirmed
                            onClick={approve}
                            confirmed={approval === ApprovalState.APPROVED}
                            disabled={approval !== ApprovalState.NOT_APPROVED || isButtonDisabled}
                            altDisabledStyle={approval === ApprovalState.PENDING}
                        >
                            {approval === ApprovalState.PENDING ? (
                                <Dots>Approving</Dots>
                            ) : approval === ApprovalState.APPROVED ? (
                                'Approved'
                            ) : (
                                'Approve'
                            )}
                        </ButtonConfirmed>
                    )}
                    {((state.mode === 'approve' && approval === ApprovalState.APPROVED) || state.mode === 'permit') && (
                        <ButtonConfirmed
                            disabled={noLiquidityTokens || state.isMigrationPending || isButtonDisabled}
                            onClick={onPress}
                        >
                            {state.isMigrationPending ? <Dots>Migrating</Dots> : 'Migrate'}
                        </ButtonConfirmed>
                    )}
                </>
            )}
            {error.message && error.code !== 4001 && (
                <div className="text-red text-center font-medium">{error.message}</div>
            )}
            <div className="text-xs text-low-emphesis text-center">
                {`Your ${exchange} ${state.selectedLPToken.tokenA.symbol}/${state.selectedLPToken.tokenB.symbol} liquidity will become MistSwap ${state.selectedLPToken.tokenA.symbol}/${state.selectedLPToken.tokenB.symbol} liquidity.`}
            </div>
        </div>
    )
}

const ExchangeLiquidityPairs = ({ state, exchange }: { state: MigrateState; exchange: undefined | string }) => {
    function onToggle(lpToken: LPToken) {
        state.setSelectedLPToken(state.selectedLPToken !== lpToken ? lpToken : undefined)
        state.setAmount('')
    }

    if (!state.mode) {
        return null
    }

    if (state.lpTokens.length === 0) {
        return (
            <AutoColumn style={{ minHeight: 200, justifyContent: 'center', alignItems: 'center' }}>
                <div className="font-medium">
                    No Liquidity found.
                </div>
            </AutoColumn>
        )
    }

    return (
        <>
            {state.lpTokens.reduce<JSX.Element[]>((acc, lpToken) => {
                if ((lpToken.balance as CurrencyAmount<Token>).greaterThan(0)) {
                    acc.push(
                        <LPTokenSelect
                            lpToken={lpToken}
                            onToggle={onToggle}
                            isSelected={state.selectedLPToken === lpToken}
                            updating={state.updatingLPTokens}
                            exchange={exchange}
                        />
                    )
                }
                return acc
            }, [])}
        </>
    )
}

export default function MigrateV2() {
  const { i18n } = useLingui()
  const { account, chainId } = useActiveWeb3React()

  const state = useMigrateState()

  let exchange

  if (chainId === ChainId.SMARTBCH) {
      exchange = 'BenSwap'
  } else if (chainId === ChainId.SMARTBCH_AMBER) {
      exchange = 'BenSwap Amber'
  }

  return (
    <Container id="migrate-page" className="py-4 space-y-6 md:py-8 lg:py-12" maxWidth="2xl">
      <Head>
          <title key="title">Migrate LP tokens | Mist</title>
          <meta
            key="description"
            name="description"
            content="Migrate LP tokens to Mist LP tokens"
          />
          <meta key="twitter:url" name="twitter:url" content="https://app.mistswap.fi/migrate" />
          <meta key="twitter:title" name="twitter:title" content="MIGRATE LP" />
          <meta
            key="twitter:description"
            name="twitter:description"
            content="Migrate LP tokens to Mist LP tokens"
          />
          <meta key="twitter:image" name="twitter:image" content="https://app.mistswap.fi/xmist-sign.png" />
          <meta key="og:title" property="og:title" content="MIGRATE LP" />
          <meta key="og:url" property="og:url" content="https://app.mistswap.fi/migrate" />
          <meta key="og:image" property="og:image" content="https://app.mistswap.fi/xmist-sign.png" />
          <meta
            key="og:description"
            property="og:description"
            content="Migrate LP tokens to Mist LP tokens"
          />
      </Head>

      <div className="p-4 mb-3 space-y-3 text-center">
        <Typography component="h1" variant="h2">
          Migrate {exchange} Liquidity
        </Typography>
      </div>


      <div className="p-4 space-y-4 rounded bg-dark-900">
          {!account ? (
              <Typography variant="body" className="text-primary text-center p-4">
                  Connect to a wallet to view your liquidity.
              </Typography>
          ) : state.loading ? (
              <Typography variant="body" className="text-primary text-center p-4">
                  <Dots>Loading your {exchange} liquidity positions</Dots>
              </Typography>
          ) : (
              <>
                  {!state.loading && <Typography variant="body">Your Wallet</Typography>}
                  <MigrateModeSelect state={state} />
                  {!state.loading && state.mode && (
                      <div>
                          <Typography variant="body">Your Liquidity</Typography>
                          <Typography variant="caption" className="text-secondary">
                              Click on a pool below, input the amount you wish to migrate or select max, and click
                              migrate.
                          </Typography>
                      </div>
                  )}

                  <ExchangeLiquidityPairs state={state} exchange={exchange} />
                  <AmountInput state={state} />
                  <MigrateButtons state={state} exchange={exchange} />
              </>
          )}
      </div>
    </Container>
  )
}
