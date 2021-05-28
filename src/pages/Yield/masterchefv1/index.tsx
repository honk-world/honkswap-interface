import { useFuse, useSortableData } from 'hooks'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import styled from 'styled-components'
import useFarms from 'hooks/useFarms'
import { RowBetween } from '../../../components/Row'
import { formattedNum, formattedPercent } from '../../../utils'
import { Card, CardHeader, Paper, Search, DoubleLogo, TokenLogo } from '../components'
import InputGroup from './InputGroup'
import { SimpleDots as Dots } from 'kashi/components'
import { Helmet } from 'react-helmet'

import Badge from '../../../components/Badge'
import _ from 'lodash'
import { getTokenIcon } from '../../../kashi/functions'
import DepositGraphic from 'assets/kashi/deposit-graphic.png'

export const FixedHeightRow = styled(RowBetween)`
    height: 24px;
`

export default function Yield(): JSX.Element {
    const query = useFarms()
    const farms = query?.farms
    const userFarms = query?.userFarms

    const tvl = _.sumBy(farms, 'tvl')

    // Search Setup
    const options = { keys: ['symbol', 'name', 'pairAddress'], threshold: 0.4 }
    const { result, search, term } = useFuse({
        data: farms && farms.length > 0 ? farms : [],
        options
    })
    const flattenSearchResults = result.map((a: { item: any }) => (a.item ? a.item : a))
    // Sorting Setup
    const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)

    return (
        <>
            <Helmet>
                <title>Yield | Sushi</title>
                <meta name="description" content="Farm SUSHI by staking LP (Liquidity Provider) tokens" />
            </Helmet>
            <div className="container mx-auto grid grid-cols-12 gap-4">
                <div className="col-span-3" style={{ maxHeight: '40rem' }}>
                    <Card
                        className="h-full bg-dark-900"
                        backgroundImage={DepositGraphic}
                        title={'Create a new Kashi Market'}
                        description={
                            'If you want to supply to a market that is not listed yet, you can use this tool to create a new pair.'
                        }
                    />
                </div>
                <div className="col-span-9">
                    <Card
                        className="h-full bg-dark-900"
                        header={
                            <CardHeader className="flex flex-col justify-between items-center bg-dark-800">
                                <div className="flex w-full justify-between">
                                    <div className="hidden md:block items-center">
                                        {/* <BackButton defaultRoute="/pool" /> */}
                                        <div className="text-lg mr-2 whitespace-nowrap flex items-center">
                                            <div className="mr-2">Yield Instruments</div>
                                            <Badge color="blue">V1 Rewarder</Badge>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="text-sm text-gray-500 mr-2">
                                                Total Deposits: {farms && farms.length > 0 && formattedNum(tvl, true)}
                                            </div>
                                        </div>
                                    </div>
                                    <Search search={search} term={term} />
                                </div>
                                <div className="flex">
                                    <div className="">Something</div>
                                    <div className="">Something</div>
                                    <div className="">Something</div>
                                </div>
                            </CardHeader>
                        }
                    >
                        {/* UserFarms */}
                        {userFarms && userFarms.length > 0 && (
                            <>
                                <div className="pb-4">
                                    <div className="grid grid-cols-3 md:grid-cols-4 pb-4 px-4 text-sm  text-secondary">
                                        <div className="flex items-center">
                                            <div>Your Yields</div>
                                        </div>
                                        <div className="hidden md:block ml-4">
                                            <div>Claim</div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <div>Deposited</div>
                                        </div>
                                        <div className="flex items-center justify-end">
                                            <div>APY</div>
                                        </div>
                                    </div>
                                    <div className="flex-col space-y-2">
                                        {userFarms.map((farm: any, i: number) => {
                                            return <UserBalance key={farm.address + '_' + i} farm={farm} />
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                        {/* All Farms */}
                        <div className="grid grid-cols-3 md:grid-cols-4 pb-4 px-4 text-sm  text-secondary">
                            <div
                                className="flex items-center cursor-pointer hover:text-secondary"
                                onClick={() => requestSort('symbol')}
                            >
                                <div>Instruments</div>
                                {sortConfig &&
                                    sortConfig.key === 'symbol' &&
                                    ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                        (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                            </div>
                            <div className="hidden md:block ml-4">
                                <div className="flex items-center justify-start">
                                    <div className="pr-2">Pool Rewards</div>
                                    <Badge color="blue">2X</Badge>
                                </div>
                            </div>
                            <div className="hover:text-secondary cursor-pointer" onClick={() => requestSort('tvl')}>
                                <div className="flex items-center justify-end">
                                    <div>TVL</div>
                                    {sortConfig &&
                                        sortConfig.key === 'tvl' &&
                                        ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                            (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                                </div>
                            </div>
                            <div
                                className="hover:text-secondary cursor-pointer"
                                onClick={() => requestSort('roiPerYear')}
                            >
                                <div className="flex items-center justify-end">
                                    <div>APY (incl. Fees)</div>
                                    {sortConfig &&
                                        sortConfig.key === 'roiPerYear' &&
                                        ((sortConfig.direction === 'ascending' && <ChevronUp size={12} />) ||
                                            (sortConfig.direction === 'descending' && <ChevronDown size={12} />))}
                                </div>
                            </div>
                        </div>
                        <div className="flex-col space-y-2">
                            {items && items.length > 0 ? (
                                items.map((farm: any, i: number) => {
                                    return <TokenBalance key={farm.address + '_' + i} farm={farm} />
                                })
                            ) : (
                                <>
                                    {term ? (
                                        <div className="w-full text-center py-6">No Results.</div>
                                    ) : (
                                        <div className="w-full text-center py-6">
                                            <Dots>Fetching Instruments</Dots>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    )
}

const TokenBalance = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'SLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="bg-dark-850 grid grid-cols-3 md:grid-cols-4 px-4 py-2  cursor-pointer select-none rounded rounded-b-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="text-sm sm:text-base font-semibold">
                            {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                        </div>
                        <div className="hidden md:block text-sm sm:text-base ml-4 text-gray-500">{'SUSHI'}</div>
                        <div className="text-gray-500 text-sm sm:text-base text-right">
                            {formattedNum(farm.tvl, true)}
                        </div>
                        <div className="font-semibold text-sm sm:text-base text-right">
                            {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                        </div>
                    </div>
                    <div
                        className="grid grid-cols-3 md:grid-cols-4 py-4 px-4 cursor-pointer select-none rounded text-sm"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="col-span-1 flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={farm.liquidityPair.token0.id}
                                    a1={farm.liquidityPair.token1.id}
                                    size={35}
                                    margin={true}
                                />
                            </div>
                            {/* <div className="hidden sm:block">
                                {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                            </div> */}
                        </div>
                        <div className="md:col-span-1 hidden md:flex flex-row space-x-2 justify-start items-center ml-4">
                            <div>
                                <img
                                    src={getTokenIcon('0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 1)}
                                    className="block w-10 h-10 rounded-full"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col pl-2 space-y-1">
                                <div className="text-gray-500 text-xs">
                                    {formattedNum(farm.sushiRewardPerDay)} SUSHI / day
                                </div>
                                {/* <div className="text-gray-500 text-xs">
                                    {formattedNum(farm.secondaryRewardPerDay)} MATIC / day
                                </div> */}
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                {/* <div className="text-right">{formattedNum(farm.tvl, true)} </div> */}
                                <div className="text-gray-500 text-right font-semibold text-sm sm:text-sm">
                                    {formattedNum(farm.slpBalance / 1e18, false)} SLP
                                </div>
                                <div className="text-gray-500 text-right text-xs">Market Staked</div>
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                <div className="text-gray-500 text-right font-semibold text-base sm:text-lg">
                                    {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                                    {/* {formattedPercent(farm.roiPerMonth * 100)}{' '} */}
                                </div>
                                <div className="text-gray-500 text-right text-xs">annualized</div>
                                {/* <div className="text-gray-500 text-right text-xs">per month</div> */}
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'LP'}
                        />
                    )}
                </Paper>
            )}
            {farm.type === 'KMP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="bg-dark-850 grid grid-cols-3 md:grid-cols-4 px-4 py-2  cursor-pointer select-none rounded rounded-b-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="text-sm sm:text-base font-semibold">{farm && farm.symbol}</div>
                        <div className="hidden md:block text-sm sm:text-base ml-4 text-gray-500">{'SUSHI'}</div>
                        <div className="text-gray-500 text-sm sm:text-base text-right">
                            {formattedNum(farm.tvl, true)}
                        </div>
                        <div className="font-semibold text-sm sm:text-base text-right">
                            {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                        </div>
                    </div>
                    <div
                        className="grid grid-cols-4 py-4 px-4 cursor-pointer select-none rounded text-sm"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={'kashiLogo'}
                                    a1={farm.liquidityPair.asset.id}
                                    size={35}
                                    margin={true}
                                    higherRadius={'0px'}
                                />
                            </div>
                            {/* <div className="hidden sm:block">{farm && farm.symbol}</div> */}
                        </div>
                        <div className="md:col-span-1 hidden md:flex flex-row space-x-2 justify-start items-center ml-4">
                            <div>
                                <img
                                    src={getTokenIcon('0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', 1)}
                                    className="block w-10 h-10 rounded-full"
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col pl-2 space-y-1">
                                <div className="text-gray-500 text-xs">
                                    {formattedNum(farm.sushiRewardPerDay)} SUSHI / day
                                </div>
                                {/* <div className="text-gray-500 text-xs">
                                    {formattedNum(farm.secondaryRewardPerDay)} MATIC / day
                                </div> */}
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.tvl, true)} </div>
                                <div className="text-secondary text-right">
                                    {formattedNum(farm.totalAssetStaked, false)} KMP
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div className="text-right font-semibold text-xl">
                                {farm.roiPerYear > 10000 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.collateral.id}
                            token1Address={farm.liquidityPair.asset.id}
                            type={'KMP'}
                            assetSymbol={farm.liquidityPair.asset.symbol}
                            assetDecimals={farm.liquidityPair.asset.decimals}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}

const UserBalance = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'SLP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="bg-dark-850 grid grid-cols-3 md:grid-cols-4 px-4 py-2  cursor-pointer select-none rounded rounded-b-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="text-sm sm:text-base font-semibold">
                            {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                        </div>
                        <div className="hidden md:block text-sm sm:text-base ml-4 text-gray-500">{'SUSHI'}</div>
                        <div className="text-gray-500 text-sm sm:text-base text-right">
                            {formattedNum(farm.tvl, true)}
                        </div>
                        <div className="font-semibold text-sm sm:text-base text-right">
                            {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                        </div>
                    </div>
                    <div
                        className="grid grid-cols-3 py-4 px-4 cursor-pointer select-none rounded text-sm"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={farm.liquidityPair.token0.id}
                                    a1={farm.liquidityPair.token1.id}
                                    size={26}
                                    margin={true}
                                />
                            </div>
                            <div className="hidden sm:block">
                                {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className="text-secondary text-right">
                                    {formattedNum(farm.depositedLP, false)} SLP
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.pendingSushi)} </div>
                                <div className="text-secondary text-right">SUSHI</div>
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'LP'}
                        />
                    )}
                </Paper>
            )}
            {farm.type === 'KMP' && (
                <Paper className="bg-dark-800">
                    <div
                        className="grid grid-cols-3 py-4 px-4 cursor-pointer select-none rounded text-sm"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={'kashiLogo'}
                                    a1={farm.liquidityPair.asset.id}
                                    size={32}
                                    margin={true}
                                    higherRadius={'0px'}
                                />
                            </div>
                            <div className="hidden sm:block">{farm && farm.symbol}</div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className="text-secondary text-right">
                                    {formattedNum(farm.depositedLP, false)} KMP
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="text-right">{formattedNum(farm.pendingSushi)} </div>
                                <div className="text-secondary text-right">SUSHI</div>
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <InputGroup
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.collateral.id}
                            token1Address={farm.liquidityPair.asset.id}
                            type={'KMP'}
                            assetSymbol={farm.liquidityPair.asset.symbol}
                            assetDecimals={farm.liquidityPair.asset.decimals}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}
