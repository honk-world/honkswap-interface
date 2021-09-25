import { Chef, PairType } from '../../features/onsen/enum'
import { useActiveWeb3React, useFuse } from '../../hooks'
import {
  useAverageBlockTime,
  useEthPrice,
  useFarmPairAddresses,
  useFarms,
  useMasterChefV1SushiPerBlock,
  useMasterChefV1TotalAllocPoint,
  useSushiPairs,
  useSushiPrice,
} from '../../services/graph'

import { BigNumber } from '@ethersproject/bignumber'
import { ChainId, WNATIVE } from '@mistswapdex/sdk'
import Container from '../../components/Container'
import FarmList from '../../features/onsen/FarmList'
import Head from 'next/head'
import Menu from '../../features/onsen/FarmMenu'
import React from 'react'
import Search from '../../components/Search'
import { classNames } from '../../functions'
import dynamic from 'next/dynamic'
import { getAddress } from '@ethersproject/address'
import useFarmRewards from '../../hooks/useFarmRewards'
import { usePositions } from '../../features/onsen/hooks'
import { useRouter } from 'next/router'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  // const pairAddresses = useFarmPairAddresses()

  // const swapPairs = useSushiPairs({ subset: pairAddresses, shouldFetch: !!pairAddresses })
  const swapPairs = [
    {
      id: "0xDB70603f600a3eab200bA0F08fbDca467bD5a1D5",
      reserve0: "5708.95616801",
      reserve1: "81415.395776750428407421",
      reserveETH: "162830.791553500856814842",
      reserveUSD: "510584588.0507161230997462761469069",
      timestamp: "1599830986",
      token0: {
        derivedETH: "14.26099507173652177472868535470121",
        id: "0x17F4FCF5b6E0A95D4eE331c8529041896A073F9b",
        name: "Bitcoin Cash",
        symbol: "BCH",
        totalSupply: "17720",
        token0Price: "0.07012133409833881784416110848389942",
      },
      token1: {
        derivedETH: "1",
        id: "0xD22D61c9c44d13F286Cd7109b3F3e5A4A51914cB",
        name: "MistToken",
        symbol: "MIST",
        totalSupply: "17720",
        token1Price: "14.26099507173652177472868535470121",
      },
      totalSupply: "0.008844376345923753",
      trackedReserveETH: "162830.791553500856814842",
      txCount: "152817",
      untrackedVolumeUSD: "10413947170.78512043307707605351976",
      volumeUSD: "10413947170.78512043307707605351976",
    },
    {
      id: "0x9A520C877c62aB833276F6FD871D61898aFE0896",
      reserve0: "5708.95616801",
      reserve1: "81415.395776750428407421",
      reserveETH: "162830.791553500856814842",
      reserveUSD: "510584588.0507161230997462761469069",
      timestamp: "1599830986",
      token0: {
        derivedETH: "14.26099507173652177472868535470121",
        id: "0x17F4FCF5b6E0A95D4eE331c8529041896A073F9b",
        name: "Bitcoin Cash",
        symbol: "BCH",
        totalSupply: "17720",
        token0Price: "0.07012133409833881784416110848389942",
      },
      token1: {
        derivedETH: "1",
        id: "0x74D6635eEeBdB79d02f0BFebc1C4bE25e94Ac27a",
        name: "tc",
        symbol: "TC",
        totalSupply: "17720",
        token1Price: "14.26099507173652177472868535470121",
      },
      totalSupply: "0.008844376345923753",
      trackedReserveETH: "162830.791553500856814842",
      txCount: "152817",
      untrackedVolumeUSD: "10413947170.78512043307707605351976",
      volumeUSD: "10413947170.78512043307707605351976",
    },
  ]

  const kashiPairs = []

  // const farms = useFarms()
  const farms = [
    {
      accSushiPerShare: "3052662329655",
      allocPoint: 1000,
      balance: "64614248892144580651",
      chef: 0,
      id: 1,
      lastRewardBlock: "750000",
      owner: {
          id: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
          sushiPerBlock: "100000000000000000000",
          totalAllocPoint: "238028"
      },
      pair: "0xDB70603f600a3eab200bA0F08fbDca467bD5a1D5",
      userCount: 20,
    },
    {
      accSushiPerShare: "3052662329655",
      allocPoint: 2,
      balance: "64614248892144580651",
      chef: 0,
      id: 0,
      lastRewardBlock: "750000",
      owner: {
          id: "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd",
          sushiPerBlock: "100000000000000000000",
          totalAllocPoint: "238028"
      },
      pair: "0x9A520C877c62aB833276F6FD871D61898aFE0896",
      userCount: 20,
    },
  ]

  const positions = usePositions(chainId)

  // const averageBlockTime = useAverageBlockTime()
  const averageBlockTime = 6;

  const masterChefV1TotalAllocPoint = useMasterChefV1TotalAllocPoint()

  const masterChefV1SushiPerBlock = useMasterChefV1SushiPerBlock()

  // TODO: Obviously need to sort this out but this is fine for time being,
  // prices are only loaded when needed for a specific network
  const [sushiPrice, ethPrice] = [
    useSushiPrice(),
    useEthPrice(),
  ]

  const blocksPerDay = 86400 / Number(averageBlockTime)

  const map = (pool) => {
    // TODO: Account for fees generated in case of swap pairs, and use standard compounding
    // algorithm with the same intervals acrosss chains to account for consistency.
    // For lending pairs, what should the equivilent for fees generated? Interest gained?
    // How can we include this?

    // TODO: Deal with inconsistencies between properties on subgraph
    pool.owner = pool?.owner || pool?.masterChef
    pool.balance = pool?.balance || pool?.slpBalance

    const swapPair = swapPairs?.find((pair) => pair.id === pool.pair)
    const kashiPair = kashiPairs?.find((pair) => pair.id === pool.pair)

    const type = swapPair ? PairType.SWAP : PairType.KASHI

    const pair = swapPair || kashiPair

    const blocksPerHour = 3600 / averageBlockTime

    function getRewards() {
      // TODO: Some subgraphs give sushiPerBlock & sushiPerSecond, and mcv2 gives nothing
      const sushiPerBlock =
        pool?.owner?.sushiPerBlock / 1e18 ||
        (pool?.owner?.sushiPerSecond / 1e18) * averageBlockTime ||
        masterChefV1SushiPerBlock

      const rewardPerBlock = (pool.allocPoint / pool.owner.totalAllocPoint) * sushiPerBlock

      const defaultReward = {
        token: 'MIST',
        icon: 'https://raw.githubusercontent.com/mistswapdex/icons/master/token/mist.jpg',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: sushiPrice,
      }

      const defaultRewards = [defaultReward]

      return defaultRewards
    }

    const rewards = getRewards()

    const balance = swapPair ? Number(pool.balance / 1e18) : pool.balance / 10 ** kashiPair.token0.decimals

    const tvl = swapPair
      ? (balance / Number(swapPair.totalSupply)) * Number(swapPair.reserveUSD)
      : balance * kashiPair.token0.derivedETH * ethPrice

    const roiPerBlock =
      rewards.reduce((previousValue, currentValue) => {
        return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
      }, 0) / tvl

    const roiPerHour = roiPerBlock * blocksPerHour

    const roiPerDay = roiPerHour * 24

    const roiPerMonth = roiPerDay * 30

    const roiPerYear = roiPerMonth * 12

    const position = positions.find((position) => position.id === pool.id && position.chef === pool.chef)

    return {
      ...pool,
      ...position,
      pair: {
        ...pair,
        decimals: pair.type === PairType.KASHI ? Number(pair.asset.tokenInfo.decimals) : 18,
        type,
      },
      balance,
      roiPerBlock,
      roiPerHour,
      roiPerDay,
      roiPerMonth,
      roiPerYear,
      rewards,
      tvl,
    }
  }

  const FILTER = {
    all: (farm) => farm.allocPoint !== '0',
    portfolio: (farm) => farm?.amount && !farm.amount.isZero(),
    sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    '2x': (farm) => (farm.chef === Chef.MASTERCHEF_V2) && farm.allocPoint !== '0',
  }

  const data = farms
    .filter((farm) => {
      return (
        (swapPairs && swapPairs.find((pair) => pair.id === farm.pair)) ||
        (kashiPairs && kashiPairs.find((pair) => pair.id === farm.pair))
      )
    })
    .map(map)
    .filter((farm) => {
      return type in FILTER ? FILTER[type](farm) : true
    })

  const options = {
    keys: ['pair.id', 'pair.token0.symbol', 'pair.token1.symbol'],
    threshold: 0.4,
  }

  const { result, term, search } = useFuse({
    data,
    options,
  })

  return (
    <Container id="farm-page" className="grid h-full grid-cols-4 py-4 mx-auto md:py-8 lg:py-12 gap-9" maxWidth="7xl">
      <Head>
        <title>Farm | Mist</title>
        <meta key="description" name="description" content="Farm MIST" />
      </Head>
      <div className={classNames('sticky top-0 hidden lg:block md:col-span-1')} style={{ maxHeight: '40rem' }}>
        <Menu positionsLength={positions.length} />
      </div>
      <div className={classNames('space-y-6 col-span-4 lg:col-span-3')}>
        <Search
          search={search}
          term={term}
          inputProps={{
            className:
              'relative w-full bg-transparent border border-transparent focus:border-gradient-r-blue-pink-dark-900 rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5',
          }}
        />

        <div className="flex items-center text-lg font-bold text-high-emphesis whitespace-nowrap">
          Farms{' '}
          <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
        </div>

        <FarmList farms={result} term={term} />
      </div>
    </Container>
  )
}
