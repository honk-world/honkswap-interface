import Input from '../Input'
import React, { useCallback } from 'react'
import Button from '../Button'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'

interface PercentInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  id: string
}

export default function PercentInputPanel({ value, onUserInput, id }: PercentInputPanelProps) {
  const onMax = useCallback(() => {
    value = "100"
    onUserInput(value)
  }, [value, onUserInput])

  return (
    <div id={id} className="p-5 rounded bg-dark-800">
      <div className="flex flex-col justify-between space-y-3 sm:space-y-0 sm:flex-row">
        <div className="w-full text-white sm:w-2/5" style={{ margin: 'auto 0px' }}>
          Amount to Remove
        </div>
        <div className="flex items-center w-full p-3 space-x-3 text-xl font-bold rounded bg-dark-900 sm:w-3/5">
          <Button
            onClick={onMax}
            size="xs"
            className="text-xs font-medium bg-transparent border rounded-full hover:bg-primary border-low-emphesis text-secondary whitespace-nowrap"
          >
            {i18n._(t`Max`)}
          </Button>
          <Input.Percent
            className="token-amount-input"
            value={value}
            onUserInput={(val) => {
              onUserInput(val)
            }}
            align="right"
          />
          <div className="text-xl font-bold percent-translate">%</div>
        </div>
      </div>
    </div>
  )
}
