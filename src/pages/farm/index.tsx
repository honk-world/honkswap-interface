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
import { ChainId, WNATIVE, Token, WBCH, MASTERCHEF_ADDRESS } from '@honkswapdex/sdk'
import { HONK, FLEXUSD } from '../../config/tokens'
import Container from '../../components/Container'
import FarmList from '../../features/onsen/FarmList'
import Head from 'next/head'
import Image from 'next/image'
import Menu from '../../features/onsen/FarmMenu'
import React, { useEffect } from 'react'
import Search from '../../components/Search'
import { classNames } from '../../functions'
import dynamic from 'next/dynamic'
import { getAddress } from '@ethersproject/address'
import useFarmRewards from '../../hooks/useFarmRewards'
import usePool from '../../hooks/usePool'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePositions, usePendingSushi } from '../../features/onsen/hooks'
import { useRouter } from 'next/router'
import { updateUserFarmFilter } from '../../state/user/actions'
import { getFarmFilter, useUpdateFarmFilter } from '../../state/user/hooks'

export default function Farm(): JSX.Element {
  const { chainId } = useActiveWeb3React()
  const router = useRouter()

  const type = router.query.filter as string

  const savedFilter = getFarmFilter()

  if (!type && savedFilter) {
    router.push(`/farm?filter=${savedFilter}`)
  }

  const updateFarmFilter = useUpdateFarmFilter()
  updateFarmFilter(type)

  const hardcodedPairs = { 
    [ChainId.SMARTBCH]: {
      "0xC29f4FeBB17A16da9D29bbFa1F3A79d53E46B71F": {
        farmId: 0,
        allocPoint: 20,
        token0: WBCH[ChainId.SMARTBCH],
        token1: HONK[ChainId.SMARTBCH],
      },
      "0x56c92D1d401697dFFA132ED4a1274cdbBd0Aff05": {
        farmId: 1,
        allocPoint: 10,
        token0: HONK[ChainId.SMARTBCH],
        token1: FLEXUSD,
      },
      "0x47982804BbebD6456cA15bd5D11C367A46E61B21": {
        farmId: 2,
        allocPoint: 5,
        token0: HONK[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x6732E55Ac3ECa734F54C26Bd8DF4eED52Fb79a6E', 18, 'JOY', 'Joystick')
      },
      "0x00595DA02F1b7f80C8e341A21a553E5154ff5508": {
        farmId: 3,
        allocPoint: 0, //3
        token0: HONK[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x98Dd7eC28FB43b3C4c770AE532417015fa939Dd3', 18, 'FLEX', 'Flex Coin')
      },
      "0xC9FBE3D954C00D75F558D6F28cEE1A5Cd2D672A7": {
        farmId: 4,
        allocPoint: 0, //2
        token0: HONK[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129', 18, 'MIST', 'Mist Token')
      },
      "0x67cDA96C3c9CC967DcD8cD01e965647ca4029d08": {
        farmId: 6,
        allocPoint: 0,
        token0: HONK[ChainId.SMARTBCH],
        token1: new Token(ChainId.SMARTBCH, '0x9288df32951386a8254aeaf80a66b78ccaf75b82', 2, 'sBUSD', 'Smart BUSD')
      }
    },
    [ChainId.SMARTBCH_AMBER]: {
      "0x66f72b9ab277f49508c6b57ccb28786f1231ccf5": {
        farmId: 1,
        allocPoint: 1000,
        token0: new Token(ChainId.SMARTBCH_AMBER, '0x3d2cd929D1fC1dA68D2557AB85336C2740b1Ae81', 18, 'MIST', 'Mist Token'),
        token1: HONK[ChainId.SMARTBCH_AMBER],
      }
    }
  };

  const kashiPairs = [] // unused
  const swapPairs = []
  let farms = []

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
        decimals: pair.token0.decimals
      },
      token1: {
        id: pair.token1.address,
        name: pair.token1.name,
        symbol: pair.token1.symbol,
        decimals: pair.token1.decimals
      },
    })

    const f = {
      pair: pairAddress,
      symbol: `${hardcodedPairs[chainId][pairAddress].token0.symbol}-${hardcodedPairs[chainId][pairAddress].token1.symbol}`,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pool: usePool(pairAddress),
      allocPoint: pair.allocPoint,
      balance: "1000000000000000000",
      chef: 0,
      id: pair.farmId,
      pendingSushi: undefined,
      pending: 0,
      owner: {
        id: MASTERCHEF_ADDRESS[chainId],
        sushiPerBlock: "424385",
        totalAllocPoint: "40"
      },
      userCount: 1,
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    f.pendingSushi = usePendingSushi(f)
    f.pending = Number.parseFloat(f.pendingSushi?.toFixed())

    farms.push(f);
  }

  farms = farms.sort((a, b) => b.allocPoint - a.allocPoint);
  
  const flexUSDHonkPool = farms.find((v) => v.pair === '0x56c92D1d401697dFFA132ED4a1274cdbBd0Aff05').pool; 
  //const bchFlexUSDPool = farms.find((v) => v.pair === '0x66f72b9ab277f49508c6b57ccb28786f1231ccf5').pool; 
  
  let bchPriceUSD = 0;
  let honkPriceUSD = 0;
  // todo: readd when we have some data
  // if (bchFlexUSDPool.reserves) {
  //   bchPriceUSD = Number.parseFloat(bchFlexUSDPool.reserves[1].toFixed()) / Number.parseFloat(bchFlexUSDPool.reserves[0].toFixed());
  // }
  if (flexUSDHonkPool.reserves) {
    honkPriceUSD = Number.parseFloat(flexUSDHonkPool.reserves[0].toFixed()) / Number.parseFloat(flexUSDHonkPool.reserves[1].toFixed(2))
  }

  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    MASTERCHEF_ADDRESS[chainId],
    farms.map((farm) => new Token(chainId, farm.pair, 18, 'LP', 'LP Token')),
  )

  if (! fetchingV2PairBalances) {
    for (let i=0; i<farms.length; ++i) {
      if (v2PairsBalances.hasOwnProperty(farms[i].pair) && farms[i].pool.totalSupply) {
        const totalSupply = Number.parseFloat(farms[i].pool.totalSupply.toFixed());
        const chefBalance = Number.parseFloat(v2PairsBalances[farms[i].pair].toFixed());

        let tvl = 0;
        if (farms[i].pool.token0 === HONK[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[0].toFixed());
          tvl = reserve / totalSupply * chefBalance * honkPriceUSD * 2;
        }
        else if (farms[i].pool.token1 === HONK[chainId].address) {
          const reserve = Number.parseFloat(farms[i].pool.reserves[1].toFixed(2));
          tvl = reserve / totalSupply * chefBalance * honkPriceUSD * 2;

          // quick hack to get this working
          if (hardcodedPairs[chainId][farms[i].pair].token1.symbol == 'sBUSD') {
            tvl = farms[i].pool.reserves[1].div(farms[i].pool.totalSupply).toNumber() * chefBalance * honkPriceUSD * 2 * 10000000000000000
          }
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
        farms[i].chefBalance = chefBalance;
      } else {
        farms[i].tvl = "0";
        farms[i].chefBalance = 0;
      }
    }
  }

  const positions = usePositions(chainId)

  // const averageBlockTime = useAverageBlockTime()
  const averageBlockTime = 6;

  // const masterChefV1TotalAllocPoint = useMasterChefV1TotalAllocPoint()

  const masterChefV1SushiPerBlock = useMasterChefV1SushiPerBlock()

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

    const blocksPerDay = 15709 // calculated empirically

    function getRewards() {
      // TODO: Some subgraphs give sushiPerBlock & sushiPerSecond, and mcv2 gives nothing
      const sushiPerBlock =
        pool?.owner?.sushiPerBlock / 1e2 ||
        (pool?.owner?.sushiPerSecond / 1e2) * averageBlockTime ||
        masterChefV1SushiPerBlock

      const rewardPerBlock = (pool.allocPoint / pool.owner.totalAllocPoint) * sushiPerBlock

      const defaultReward = {
        token: 'HONK',
        icon: 'https://raw.githubusercontent.com/honk-world/assets/master/blockchains/smartbch/assets/0xF2d4D9c65C2d1080ac9e1895F6a32045741831Cd/logo.png',
        rewardPerBlock,
        rewardPerDay: rewardPerBlock * blocksPerDay,
        rewardPrice: +honkPriceUSD,
      }

      const defaultRewards = [defaultReward]

      return defaultRewards
    }

    const rewards = getRewards()

    const balance = Number(pool.balance / 1e2);

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
    all: (farm) => farm.allocPoint !== 0,
    portfolio: (farm) => farm.pending !== 0,
    past: (farm) => farm.allocPoint === 0,
    // sushi: (farm) => farm.pair.type === PairType.SWAP && farm.allocPoint !== '0',
    // kashi: (farm) => farm.pair.type === PairType.KASHI && farm.allocPoint !== '0',
    // '2x': (farm) => (farm.chef === Chef.MASTERCHEF_V2) && farm.allocPoint !== '0',
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
    <Container id="farm-page" className="lg:grid lg:grid-cols-4 h-full py-4 mx-auto md:py-8 lg:py-12 gap-9" maxWidth="7xl">
      <Head>
        <title>Farm | Honk</title>
        <meta key="description" name="description" content="Farm HONK" />
      </Head>
      <div className={classNames('px-3 md:px-0 lg:block md:col-span-1')}>
        <Menu positionsLength={positions.length} />
        <div className="relative hidden h-80 lg:block">
          <Image layout="fill" objectFit="contain" objectPosition="bottom" src="/honk-machine.png" alt="" />
        </div>
      </div>
      <div className={classNames('space-y-6 col-span-4 lg:col-span-3')}>
        <Search
          search={search}
          term={term}
          className={classNames('px-3 md:px-0 ')}
          inputProps={{
            className:
              'relative w-full bg-transparent border border-transparent focus:border-gradient-r-blue-pink-dark-900 rounded placeholder-secondary focus:placeholder-primary font-bold text-base px-6 py-3.5',
          }}
        />

        <div className="hidden md:block flex items-center text-lg font-bold text-high-emphesis whitespace-nowrap">
          Farms{' '}
          <div className="w-full h-0 ml-4 font-bold bg-transparent border border-b-0 border-transparent rounded text-high-emphesis md:border-gradient-r-blue-pink-dark-800 opacity-20"></div>
        </div>

        <FarmList farms={result} term={term} />
      </div>
    </Container>
  )
}
