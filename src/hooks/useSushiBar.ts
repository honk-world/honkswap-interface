import { Currency, CurrencyAmount, Token } from '@mistswapdex/sdk'

import { useCallback } from 'react'
import { useSushiBarContract } from './useContract'
import { useTransactionAdder } from '../state/transactions/hooks'
import { getGasPrice } from '../functions/trade'

const useSushiBar = () => {
  const addTransaction = useTransactionAdder()
  const barContract = useSushiBarContract()

  const enter = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.enter(amount?.quotient.toString(), {
            gasPrice: getGasPrice(),
          })
          return addTransaction(tx, { summary: 'Staked MIST' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  const leave = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.leave(amount?.quotient.toString(), {
            gasPrice: getGasPrice(),
          })
          return addTransaction(tx, { summary: 'Unstaked MIST' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  return { enter, leave }
}

export default useSushiBar
