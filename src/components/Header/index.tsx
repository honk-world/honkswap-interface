import { ChainId, Currency, NATIVE, HONK_ADDRESS } from '@honkswapdex/sdk'
import { Feature, featureEnabled } from '../../functions/feature'
import React, { useEffect, useState } from 'react'

import { ANALYTICS_URL } from '../../constants'
import Buy from '../../features/on-ramp/ramp'
import ExternalLink from '../ExternalLink'
import Image from 'next/image'
import LanguageSwitch from '../LanguageSwitch'
import Link from 'next/link'
import More from './More'
import NavLink from '../NavLink'
import { Popover } from '@headlessui/react'
import QuestionHelper from '../QuestionHelper'
import Web3Network from '../Web3Network'
import Web3Status from '../Web3Status'
import { t } from '@lingui/macro'
import { useActiveWeb3React } from '../../hooks/useActiveWeb3React'
import { useETHBalances } from '../../state/wallet/hooks'
import { useLingui } from '@lingui/react'
import { isMobile } from 'react-device-detect'
import AddToken from '../AddToken'
import ThemeSwitch from '../ThemeSwitch'

// import { ExternalLink, NavLink } from "./Link";
// import { ReactComponent as Burger } from "../assets/images/burger.svg";

function AppBar(): JSX.Element {
  const { i18n } = useLingui()
  const { account, chainId, library } = useActiveWeb3React()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']

  return (
    //     // <header className="flex flex-row justify-between w-screen flex-nowrap">
    <header className="flex-shrink-0 w-full">
      <Popover as="nav" className="z-10 w-full bg-transparent header-border-b">
        {({ open }) => (
          <>
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <a href="/swap">
                    <Image src="/honk-world-logo.svg" alt="Honk" width="42px" height="42px" />
                  </a>
                  <div className="hidden sm:block sm:ml-4">
                    <div className="flex space-x-2">
                      {/* <Buy /> */}
                      <NavLink href="/swap">
                        <a
                          id={`swap-nav-link`}
                          className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                        >
                          {i18n._(t`Swap`)}
                        </a>
                      </NavLink>
                      <NavLink href="/pool">
                        <a
                          id={`pool-nav-link`}
                          className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                        >
                          {i18n._(t`Pool`)}
                        </a>
                      </NavLink>
                      {chainId && featureEnabled(Feature.MIGRATE, chainId) && (
                        <NavLink href={'/migrate'}>
                          <a
                            id={`migrate-nav-link`}
                            className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                          >
                            {i18n._(t`Migrate`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.LIQUIDITY_MINING, chainId) && (
                        <NavLink href={'/farm'}>
                          <a
                            id={`farm-nav-link`}
                            className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                          >
                            {i18n._(t`Farm`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.KASHI, chainId) && (
                        <>
                          <NavLink href={'/lend'}>
                            <a
                              id={`lend-nav-link`}
                              className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                            >
                              {i18n._(t`Lend`)}
                            </a>
                          </NavLink>
                          <NavLink href={'/borrow'}>
                            <a
                              id={`borrow-nav-link`}
                              className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                            >
                              {i18n._(t`Borrow`)}
                            </a>
                          </NavLink>
                        </>
                      )}
                      {chainId && featureEnabled(Feature.STAKING, chainId) && (
                        <NavLink href={'/stake'}>
                          <a
                            id={`stake-nav-link`}
                            className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                          >
                            {i18n._(t`Stake`)}
                          </a>
                        </NavLink>
                      )}
                      {chainId && featureEnabled(Feature.ANALYTICS, chainId) && (
                        <ExternalLink
                          id={`analytics-nav-link`}
                          href={ANALYTICS_URL[chainId] || 'https://analytics.honkswap.fi'}
                          className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                        >
                          {i18n._(t`Analytics`)}
                        </ExternalLink>
                      )}
                    </div>
                  </div>
                </div>

                <div className="fixed bottom-0 left-0 z-10 flex flex-row items-center justify-center w-full p-4 lg:w-auto bg-dark-1000 lg:relative lg:p-0 lg:bg-transparent">
                  <div className="flex items-center justify-between w-full space-x-2 sm:justify-end">
                    {/* {chainId && [ChainId.SMARTBCH].includes(chainId) && library && library.provider.isMetaMask && (
                      <>
                        <AddToken
                          imageProps={{src: "/images/tokens/xhonk-square.png", alt: "xHONK"}}
                          text={i18n._(t`Add xHONK to your MetaMask wallet`)}
                          metamaskProps={{
                            address: '0xdB9efDae281BCFF410d64FEB62D8f27D907745E3', 
                            symbol: 'xHONK',
                            decimals: 2,
                            image: 'https://raw.githubusercontent.com/honk-world/assets/master/blockchains/smartbch/assets/0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd/logo.png',
                          }} />
                      </>
                    )} */}

                    {chainId && chainId in HONK_ADDRESS && library && library.provider.isMetaMask && (
                      <>
                        <AddToken
                          imageProps={{ src: '/images/tokens/honk-square.png', alt: 'HONK' }}
                          text={i18n._(t`Add HONK to your MetaMask wallet`)}
                          metamaskProps={{
                            address: HONK_ADDRESS[chainId],
                            symbol: 'HONK',
                            decimals: 2,
                            image:
                              'https://raw.githubusercontent.com/honk-world/assets/master/blockchains/smartbch/assets/0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd/logo.png', //todo: change to honkbar address
                          }}
                        />
                      </>
                    )}

                    {library && library.provider.isMetaMask && (
                      <div className="hidden sm:inline-block">
                        <Web3Network />
                      </div>
                    )}

                    <div className="w-auto flex items-center rounded bg-dark-900 hover:bg-dark-800 p-0.5 whitespace-nowrap text-sm font-bold cursor-pointer select-none pointer-events-auto">
                      {account && chainId && userEthBalance && (
                        <>
                          <div className="px-3 py-2 text-primary text-bold">
                            {userEthBalance?.toSignificant(4)} {NATIVE[chainId].symbol}
                          </div>
                        </>
                      )}
                      <Web3Status />
                    </div>
                    <div className="hidden md:block sm:block">
                      <LanguageSwitch />
                    </div>
                    <ThemeSwitch />
                    <More />
                  </div>
                </div>
                <div className="flex -mr-2 sm:hidden">
                  {/* Mobile language switch */}
                  {isMobile && (
                    <>
                      <div className="inline-flex items-center">
                        <LanguageSwitch />
                      </div>
                    </>
                  )}
                  {/* Mobile menu button */}
                  <Popover.Button className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-high-emphesis focus:outline-none">
                    <span className="sr-only">{i18n._(t`Open main menu`)}</span>
                    {open ? (
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      // <X title="Close" className="block w-6 h-6" aria-hidden="true" />
                      <svg
                        className="block w-6 h-6"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                      // <Burger title="Burger" className="block w-6 h-6" aria-hidden="true" />
                    )}
                  </Popover.Button>
                </div>
              </div>
            </div>

            <Popover.Panel className="sm:hidden">
              <div className="flex flex-col px-4 pt-2 pb-3 space-y-1">
                <Link href={'/swap'}>
                  <a
                    id={`swap-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Swap`)}
                  </a>
                </Link>
                <Link href={'/pool'}>
                  <a
                    id={`pool-nav-link`}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Pool`)}
                  </a>
                </Link>

                {chainId && featureEnabled(Feature.MIGRATE, chainId) && (
                  <Link href={'/migrate'}>
                    <a
                      id={`migrate-nav-link`}
                      className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                    >
                      {i18n._(t`Migrate`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.LIQUIDITY_MINING, chainId) && (
                  <Link href={'/farm'}>
                    <a
                      id={`farm-nav-link`}
                      className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                    >
                      {' '}
                      {i18n._(t`Farm`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.KASHI, chainId) && (
                  <>
                    <Link href={'/lend'}>
                      <a
                        id={`lend-nav-link`}
                        className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                      >
                        {i18n._(t`Lend`)}
                      </a>
                    </Link>

                    <Link href={'/borrow'}>
                      <a
                        id={`borrow-nav-link`}
                        className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                      >
                        {i18n._(t`Borrow`)}
                      </a>
                    </Link>
                  </>
                )}

                {chainId && featureEnabled(Feature.STAKING, chainId) && (
                  <Link href={'/stake'}>
                    <a
                      id={`stake-nav-link`}
                      className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                    >
                      {i18n._(t`Stake`)}
                    </a>
                  </Link>
                )}

                {chainId && featureEnabled(Feature.ANALYTICS, chainId) && (
                  <ExternalLink
                    id={`analytics-nav-link`}
                    href={ANALYTICS_URL[chainId] || 'https://analytics.honkswap.fi'}
                    className="p-2 text-baseline text-primary hover:text-high-emphesis focus:text-high-emphesis md:p-3 whitespace-nowrap"
                  >
                    {i18n._(t`Analytics`)}
                  </ExternalLink>
                )}
              </div>
            </Popover.Panel>
          </>
        )}
      </Popover>
    </header>
  )
}

export default AppBar
