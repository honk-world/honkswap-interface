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
import { ChainId, WNATIVE, Token, WBCH, MASTERCHEF_ADDRESS } from '@mistswapdex/sdk'
import { MIST, FLEXUSD } from '../../config/tokens'
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
import usePool from '../../hooks/usePool'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePositions } from '../../features/onsen/hooks'
import { useRouter } from 'next/router'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  const type = router.query.filter == null ? 'all' : (router.query.filter as string)

  const hardcodedPairs = {
    [ChainId.SMARTBCH]: {
      "0x674A71E69fe8D5cCff6fdcF9F1Fa4262Aa14b154": {
        farmId: 7,
        allocPoint: 570,
        token0: MIST[ChainId.SMARTBCH],
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x437E444365aD9ed788e8f255c908bceAd5AEA645": {
        farmId: 8,
        allocPoint: 226,
        token0: MIST[ChainId.SMARTBCH],
        token1: FLEXUSD,
      },
      "0x80F712670d268cf2C05e7162674c7466c940eBE3": {
        farmId: 0,
        allocPoint: 77,
        token0: new Token(ChainId.SMARTBCH, '0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B', 18, 'EBEN', 'Green Ben'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x24f011f12Ea45AfaDb1D4245bA15dCAB38B43D13": {
        farmId: 1,
        allocPoint: 38,
        token0: FLEXUSD,
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x4fF52e9D7824EC9b4e0189F11B5aA0F02b459b03": {
        farmId: 2,
        allocPoint: 57,
        token0: new Token(ChainId.SMARTBCH, '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3', 18, 'FLEX', 'FLEX Coin'),
        token1: FLEXUSD,
      },
      "0x1EE39F93450d80981c169E59C8A641a3bC853A09": {
        farmId: 3,
        allocPoint: 8,
        token0: new Token(ChainId.SMARTBCH, '0xff3ed63bf8bc9303ea0a7e1215ba2f82d569799e', 18, 'ORB', 'ORB'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0xc98552Ad7DFC5daabAd2660DF378e0070ca75Efc": {
        farmId: 4,
        allocPoint: 8,
        token0: new Token(ChainId.SMARTBCH, '0xc70c7718C7f1CCd906534C2c4a76914173EC2c44', 18, 'KTH', 'Knuth'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x287a276401caDBe50d5C0398137490E6d45830Dd": {
        farmId: 5,
        allocPoint: 8,
        token0: new Token(ChainId.SMARTBCH, '0xe11829a7d5d8806bb36e118461a1012588fafd89', 18, 'SPICE', 'SPICE'),
        token1: WBCH[ChainId.SMARTBCH],
      },
      "0x41075d2Ea8BEF1CAfb24D9Bd2061b620cbc05B60": {
        farmId: 6,
        allocPoint: 8,
        token0: new Token(ChainId.SMARTBCH, '0x675E1d6FcE8C7cC091aED06A68D079489450338a', 18, 'ARG', 'Bitcoin Cash Argentina'),
        token1: WBCH[ChainId.SMARTBCH],
      },
    },
    [ChainId.SMARTBCH_AMBER]: {
      "0x07DE6fc05597E0E4c92C83637A8a0CA411f3a769": {
        farmId: 0,
        allocPoint: 1000,
        token0: WBCH[ChainId.SMARTBCH_AMBER],
        token1: new Token(ChainId.SMARTBCH_AMBER, '0xC6F80cF669Ab9e4BE07B78032b4821ed5612A9ce', 18, 'sc', 'testcoin2'),
      },
    }
  };

  const kashiPairs = [] // unused
  const swapPairs = []
  const farms = []

  for (const [pairAddress, pair] of Object.entries(hardcodedPairs[chainId])) {
    swapPairs.push({
      id: pairAddress,
      reserveUSD: "100000",
      totalSupply: "1000",
      timestamp: "1599830986",
      token0: {
        id: pair.token0.address,
        name: pair.token0.name,
        symbol: pair.token0.symbol,
      },
      token1: {
        id: pair.token1.address,
        name: pair.token1.name,
        symbol: pair.token1.symbol,
      },
    })

    farms.push({
      pair: pairAddress,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pool: usePool(pairAddress),
      allocPoint: pair.allocPoint,
      balance: "1000000000000000000",
      chef: 0,
      id: pair.farmId,
      owner: {
        id: MASTERCHEF_ADDRESS[chainId],
        sushiPerBlock: "1000000000000000000000",
        totalAllocPoint: "1000"
      },
      userCount: 1,
    })
  }

  const flexUSDMistPool = farms[1].pool;
  const bchFlexUSDPool = farms[3].pool;
  let bchPriceUSD = 0;
  let mistPriceUSD = 0;
  if (bchFlexUSDPool.reserves) {
    bchPriceUSD = Number.parseFloat(bchFlexUSDPool.reserves[1].toFixed()) / Number.parseFloat(bchFlexUSDPool.reserves[0].toFixed());
  }
  if (flexUSDMistPool.reserves) {
    mistPriceUSD = 1. / ( Number.parseFloat(flexUSDMistPool.reserves[0].toFixed()) / Number.parseFloat(flexUSDMistPool.reserves[1].toFixed()))
  }

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    MASTERCHEF_ADDRESS[chainId],
    farms.map((farm) => new Token(chainId, farm.pair, 18, 'LP', 'LP Token'))
  )
  if (! fetchingV2PairBalances) {
    for (let i=0; i<farms.length; ++i) {
      if (v2PairsBalances.hasOwnProperty(farms[i].pair) && farms[i].pool.totalSupply) {
        const totalSupply = Number.parseFloat(farms[i].pool.totalSupply.toFixed());
        const chefBalance = Number.parseFloat(v2PairsBalances[farms[i].pair].toFixed());

        let tvl = 0;
        if (farms[i].pool.token0 === MIST[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * mistPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === MIST[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * mistPriceUSD * 2;
        }
        else if (farms[i].pool.token0 === FLEXUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token1 === FLEXUSD.address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * 2;
        }
        else if (farms[i].pool.token0 === WBCH[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === WBCH[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed());
          tvl = reserve / totalSupply * chefBalance * bchPriceUSD * 2;
        }
        farms[i].tvl = tvl;
      } else {
        farms[i].tvl = "0";
      }
    }
  }

  const positions = usePositions(chainId)

  // const averageBlockTime = useAverageBlockTime()
  const averageBlockTime = 6;

  // const masterChefV1TotalAllocPoint = useMasterChefV1TotalAllocPoint()

  const masterChefV1SushiPerBlock = useMasterChefV1SushiPerBlock()

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

    const blocksPerDay = 15684 // calculated empirically

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
        rewardPrice: +mistPriceUSD,
      }

      const defaultRewards = [defaultReward]

      return defaultRewards
    }

    const rewards = getRewards()

    const balance = Number(pool.balance / 1e18);

    const roiPerBlock = rewards.reduce((previousValue, currentValue) => {
      return previousValue + currentValue.rewardPerBlock * currentValue.rewardPrice
    }, 0) / pool.tvl

    const roiPerDay = roiPerBlock * blocksPerDay

    const roiPerYear = roiPerDay * 365

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
      roiPerYear,
      rewards,
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
