import '../bootstrap'
import '../styles/index.css'

import * as plurals from 'make-plural/plurals'
import * as gtag from './../functions/matomo'

import { Fragment, FunctionComponent } from 'react'
import { NextComponentType, NextPageContext } from 'next'
import store, { persistor } from '../state'

import type { AppProps } from 'next/app'
import ApplicationUpdater from '../state/application/updater'
import DefaultLayout from '../layouts/Default'
import Dots from '../components/Dots'
import Head from 'next/head'
import { I18nProvider } from '@lingui/react'
import ListsUpdater from '../state/lists/updater'
import MulticallUpdater from '../state/multicall/updater'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as ReduxProvider } from 'react-redux'
import TransactionUpdater from '../state/transactions/updater'
import UserUpdater from '../state/user/updater'
import Web3ReactManager from '../components/Web3ReactManager'
import { ThemeProvider } from '../components/ThemeSwitch'
import { Web3ReactProvider } from '@web3-react/core'
import dynamic from 'next/dynamic'
import getLibrary from '../functions/getLibrary'
import { i18n } from '@lingui/core'
import { nanoid } from '@reduxjs/toolkit'
import { remoteLoader } from '@lingui/remote-loader'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const Web3ProviderNetwork = dynamic(() => import('../components/Web3ProviderNetwork'), { ssr: false })

// const Web3ReactManager = dynamic(() => import('../components/Web3ReactManager'), { ssr: false })

const sessionId = nanoid()

if (typeof window !== 'undefined' && !!window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false
}

function MyApp({
  Component,
  pageProps,
}: AppProps & {
  Component: NextComponentType<NextPageContext> & {
    Guard: FunctionComponent
    Layout: FunctionComponent
    Provider: FunctionComponent
  }
}) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])


  useEffect(() => {
    async function load(locale) {
      i18n.loadLocaleData(locale, { plurals: plurals[locale.split('_')[0]] })

      // FIXME: we can't upload locale files to aws right now, so fallback to use local files instead.
      // try {
      //   // Load messages from AWS, use q session param to get latest version from cache
      //   const resp = await fetch(`https://d3l928w2mi7nub.cloudfront.net/${locale}.json?q=${sessionId}`)
      //   const remoteMessages = await resp.json()

      //   const messages = remoteLoader({ messages: remoteMessages, format: 'minimal' })
      //   i18n.load(locale, messages)
      // } catch {

      // Load fallback messages
      const { messages } = await import(`@lingui/loader!./../../locale/${locale}.json?raw-lingui`)
      i18n.load(locale, messages)

      // }

      i18n.activate(locale)
    }

    load(router.locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.locale])

  // Allows for conditionally setting a provider to be hoisted per page
  const Provider = Component.Provider || Fragment

  // Allows for conditionally setting a layout to be hoisted per page
  const Layout = Component.Layout || DefaultLayout

  // Allows for conditionally setting a guard to be hoisted per page
  const Guard = Component.Guard || Fragment

  return (
    <Fragment>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <title key="title">MIST</title>

        <meta
          key="description"
          name="description"
          content="Trade, launch, stake, farm, invest, automate, build on the premier DeFi platform of smartBCH"
        />

        <meta name="application-name" content="MIST App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MIST App" />

        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F338C3" />

        <meta key="twitter:card" name="twitter:card" content="app" />
        <meta key="twitter:title" name="twitter:title" content="MIST App" />
        <meta key="twitter:url" name="twitter:url" content="https://app.mistswap.fi" />
        <meta
          key="twitter:description"
          name="twitter:description"
          content="Trade, launch, stake, farm, invest, automate, build on the premier DeFi platform of smartBCH"
        />
        <meta key="twitter:image" name="twitter:image" content="https://app.mistswap.fi/icons/icon-192x192.png" />
        <meta key="twitter:creator" name="twitter:creator" content="@mistswapdex" />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content="MIST App" />
        <meta key="og:url" property="og:url" content="https://app.mistswap.fi" />
        <meta key="og:image" property="og:image" content="https://app.mistswap.fi/apple-touch-icon.png" />
        <meta
          key="og:description"
          property="og:description"
          content="Trade, launch, stake, farm, invest, automate, build on the premier DeFi platform of smartBCH"
        />
      </Head>
      <I18nProvider i18n={i18n} forceRenderOnLocaleChange={false}>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <Web3ReactManager>
              <ReduxProvider store={store}>
                <PersistGate loading={<Dots>loading</Dots>} persistor={persistor}>
                  <ThemeProvider>
                    <>
                      <ListsUpdater />
                      <UserUpdater />
                      <ApplicationUpdater />
                      <TransactionUpdater />
                      <MulticallUpdater />
                    </>
                    <Provider>
                      <Layout>
                        <Guard>
                          <Component {...pageProps} />
                        </Guard>
                      </Layout>
                    </Provider>
                  </ThemeProvider>
                </PersistGate>
              </ReduxProvider>
            </Web3ReactManager>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </I18nProvider>
    </Fragment>
  )
}

export default MyApp
