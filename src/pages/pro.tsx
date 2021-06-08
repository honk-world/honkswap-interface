import Head from 'next/head'
import { FC, useState } from 'react'
import PriceHeaderStats from '../features/pro/PriceHeaderStats'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProProvider from '../context/Pro'
import TVChartContainer from '../features/pro/TVChartContainer'
import SwapHistory from '../features/pro/SwapHistory'
import QuantStats from '../features/pro/QuantStats'
import OrderForm from '../features/pro/OrderForm'
import { Responsive, WidthProvider } from 'react-grid-layout'
import Balances from '../features/pro/Balances'
import { useLingui } from '@lingui/react'
import { t } from '@lingui/macro'
import 'react-grid-layout/css/styles.css'
import SwapContainer from '../../protoype/features/swap/SwapContainer'
import { RefreshIcon } from '@heroicons/react/outline'
import QuestionHelper from '../components/QuestionHelper'

const ResponsiveGridLayout = WidthProvider(Responsive)
const originalLayouts = getFromLS('layouts') || {
    lg: [
        { i: 'OrderForm', x: 0, y: 0, w: 5, h: 10, minW: 3, minH: 4 },
        { i: 'QuantStats', x: 0, y: 20, w: 5, h: 10, minW: 3, minH: 4 },
        { i: 'SwapHistory', x: 20, y: 20, w: 4, h: 20, minW: 4, minH: 4 },
        { i: 'TVChart', x: 5, y: 0, w: 15, h: 14, minW: 4, minH: 6 },
        { i: 'Positions', x: 5, y: 20, w: 15, h: 6, minW: 4, minH: 4 },
    ],
    md: [
        { i: 'OrderForm', x: 0, y: 0, w: 3, h: 10, minW: 3, minH: 4 },
        { i: 'QuantStats', x: 0, y: 16, w: 5, h: 6, minW: 3, minH: 4 },
        { i: 'SwapHistory', x: 5, y: 16, w: 5, h: 6, minW: 4, minH: 4 },
        { i: 'TVChart', x: 3, y: 0, w: 7, h: 10, minW: 4, minH: 6 },
        { i: 'Positions', x: 0, y: 10, w: 10, h: 6, minW: 4, minH: 4 },
    ],
    sm: [
        { i: 'OrderForm', x: 0, y: 10, w: 10, h: 10, minW: 3, minH: 4 },
        { i: 'QuantStats', x: 0, y: 32, w: 6, h: 6, minW: 3, minH: 4 },
        { i: 'SwapHistory', x: 5, y: 26, w: 6, h: 6, minW: 4, minH: 4 },
        { i: 'TVChart', x: 0, y: 0, w: 6, h: 10, minW: 4, minH: 6 },
        { i: 'Positions', x: 0, y: 20, w: 6, h: 6, minW: 4, minH: 4 },
    ],
}

const Card: FC<{ title?: string }> = ({ children, title }) => {
    return (
        <div className="bg-dark-900 rounded-sm overflow-hidden h-full">
            {title && (
                <div className="flex text-sm font-bold text-secondary h-10 bg-dark-800 items-center px-4 draggable z-100 cursor-pointer">
                    {title}
                </div>
            )}
            <div className="h-[calc(100%-40px)]">{children}</div>
        </div>
    )
}

const Pro: FC = () => {
    const { i18n } = useLingui()
    const [layouts, setLayouts] = useState(
        JSON.parse(JSON.stringify(originalLayouts))
    )

    const onLayoutChange = (layout, layouts) => {
        saveToLS('layouts', layouts)
        setLayouts(layouts)
    }

    const handleReset = () => {
        deleteFromLS()
        setLayouts(originalLayouts)
    }

    return (
        <ProProvider>
            <Header />
            <Head>
                <title>SushiPro | Sushi</title>
                <meta name="description" content="Pro" />
            </Head>
            <div className="flex flex-col w-full">
                <div className="pt-3 pb-1 px-4 flex justify-between items-center">
                    <PriceHeaderStats />
                    <div className="hidden lg:flex" onClick={handleReset}>
                        <QuestionHelper text={i18n._(t`Reset layout`)}>
                            <RefreshIcon
                                width={20}
                                height={20}
                                className="text-secondary cursor-pointer hover:text-high-emphesis"
                            />
                        </QuestionHelper>
                    </div>
                </div>
                <div className="flex flex-row w-full relative">
                    <ResponsiveGridLayout
                        style={{ width: '100%' }}
                        breakpoints={{
                            lg: 1200,
                            md: 996,
                            sm: 768,
                            xs: 480,
                            xxs: 0,
                        }}
                        cols={{ lg: 24, md: 10, sm: 6, xs: 4, xxs: 2 }}
                        className="layout"
                        layouts={layouts}
                        rowHeight={40}
                        draggableHandle=".draggable"
                        onLayoutChange={(layout, layouts) =>
                            onLayoutChange(layout, layouts)
                        }
                    >
                        <div key={i18n._(t`OrderForm`)}>
                            <Card>
                                <SwapContainer />
                            </Card>
                        </div>
                        <div key={i18n._(t`QuantStats`)}>
                            <Card>
                                <QuantStats />
                            </Card>
                        </div>
                        <div key="SwapHistory">
                            <Card title={i18n._(t`Recent Trades`)}>
                                <SwapHistory />
                            </Card>
                        </div>
                        <div key="Positions">
                            <Card title={i18n._(t`Balances`)}>
                                <Balances />
                            </Card>
                        </div>
                        <div key="TVChart">
                            <div className="z-[-1] h-full w-full absolute" />
                            <Card>
                                <TVChartContainer />
                            </Card>
                        </div>
                    </ResponsiveGridLayout>
                </div>
            </div>

            <Footer />
        </ProProvider>
    )
}

function getFromLS(key) {
    let ls = {}
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem('rgl-8')) || {}
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key]
}

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(
            'rgl-8',
            JSON.stringify({
                [key]: value,
            })
        )
    }
}

function deleteFromLS(key = '') {
    if (global.localStorage) {
        global.localStorage.removeItem(key || 'rgl-8')
    }
}

export default Pro
