import Button, { ButtonProps } from '../Button'
import * as deviceInfo from 'react-device-detect'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

import { Activity } from 'react-feather'
import React, { useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useWalletModalToggle } from '../../state/application/hooks'
import useInstructionModal from '../../modals/InstructionModal/useInstuctionModal'
import InstructionModal from '../../modals/InstructionModal'

export default function Web3Connect({ color = 'gray', size = 'sm', className = '', ...rest }: ButtonProps) {
  const { i18n } = useLingui()
  const toggleWalletModal = useWalletModalToggle()
  const { error } = useWeb3React()

  const { isInstructionModalOpen, setInstructionModalOpen, onInstructionModalDismiss } = useInstructionModal()

  const handleConnectBtnClick = useCallback(() => {
    if (!window.ethereum) {
      setInstructionModalOpen(true)
      return
    }

    toggleWalletModal()
  }, [setInstructionModalOpen, toggleWalletModal])

  const pluginSupportInfo = useMemo(() => {
    if (!deviceInfo.isDesktop) {
      return null
    }

    if (deviceInfo.isFirefox) {
      return { url: 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/' }
    }

    if (deviceInfo.isChrome) {
      return { url: 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn' }
    }

    if (deviceInfo.isEdge) {
      return { url: 'https://microsoftedge.microsoft.com/addons/detail/metamask/ejbalbakoplchlghecdalmeeeajnimhm' }
    }

    return null
  }, [])

  return error ? (
    <div
      className="flex items-center justify-center px-4 py-2 font-semibold text-white border rounded bg-opacity-80 border-red bg-red hover:bg-opacity-100"
      onClick={toggleWalletModal}
    >
      <div className="mr-1">
        <Activity className="w-4 h-4" />
      </div>
      {error instanceof UnsupportedChainIdError ? i18n._(t`You are on the wrong network`) : i18n._(t`Error`)}
    </div>
  ) : (
    <>
      <Button
        id="connect-wallet"
        onClick={handleConnectBtnClick}
        variant="outlined"
        color={color}
        className={className}
        size={size}
        {...rest}
      >
        {i18n._(t`Connect to a wallet`)}
      </Button>
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onDismiss={onInstructionModalDismiss}
        instruction={
          <div>
            {pluginSupportInfo ? (
              <>
                <p>
                  {i18n._(t`Your browser is supported, but first you need to install`)}
                  <a className="text-blue" href={pluginSupportInfo.url}>
                    {' '}
                    {i18n._(t`MetaMask extension`)}
                  </a>
                </p>
              </>
            ) : (
              <>
                {i18n._(t`Your browser is not supported, please install`)}
                <a className="text-blue" href="https://metamask.io/">
                  {' '}
                  {i18n._(t`MetaMask`)}
                </a>
              </>
            )}
          </div>
        }
      />
    </>
  )
}
