import { FC, useState } from 'react'
import withPair, { WithPairProps } from '../../hoc/withPair'
import ToggleButtonGroup from '../../components/Toggle/ToggleButtonGroup'
import ToggleButton from '../../components/Toggle/ToggleButton'
import { useActiveWeb3React } from '../../hooks'
import { ChainId } from '@sushiswap/sdk'

interface TVChartContainerProps extends WithPairProps {}

const SYMBOL_MAP = {
    [ChainId.MAINNET]: '',
    [ChainId.ROPSTEN]: '',
    [ChainId.RINKEBY]: '',
    [ChainId.GÖRLI]: '',
    [ChainId.KOVAN]: '',
    [ChainId.FANTOM]: 'FTM_',
    [ChainId.FANTOM_TESTNET]: 'FTM_',
    [ChainId.MATIC]: 'PLG_',
    [ChainId.MATIC_TESTNET]: 'PLG_',
    [ChainId.XDAI]: 'XDAI_',
    [ChainId.BSC]: 'BSC_',
    [ChainId.BSC_TESTNET]: 'BSC_',
    [ChainId.MOONBEAM_TESTNET]: 'GLMR_',
    [ChainId.AVALANCHE]: 'AVA_',
    [ChainId.AVALANCHE_TESTNET]: 'AVA_',
    [ChainId.HECO]: 'HECO_',
    [ChainId.HECO_TESTNET]: 'HECO_',
    [ChainId.HARMONY]: 'ONE_',
    [ChainId.HARMONY_TESTNET]: 'ONE_',
    [ChainId.OKEX]: 'OKT_',
    [ChainId.OKEX_TESTNET]: 'OKT_',
    [ChainId.ARBITRUM]: 'ARB_',
}

const TVChartContainer: FC<TVChartContainerProps> = ({ pair }) => {
    const { chainId } = useActiveWeb3React()
    const [active, setActive] = useState(pair?.token1.symbol === 'WETH' ? 0 : 1)
    const handleClick = (e, index) => setActive(index)

    const symbol = `${SYMBOL_MAP[chainId]}${
        active === 0
            ? `${pair?.token0.symbol}${pair?.token1.symbol}_USD`
            : `${pair?.token0.symbol}${pair?.token1.symbol}`
    }`

    return (
        <div className="h-full">
            <div className="h-10 bg-dark-800 draggable">
                <ToggleButtonGroup active={active}>
                    <ToggleButton value={0} onClick={handleClick}>
                        <div className="flex gap-0.5">
                            <span>{pair?.token0.symbol}</span>
                            <span>-</span>
                            <span>USD</span>
                        </div>
                    </ToggleButton>
                    <ToggleButton value={1} onClick={handleClick}>
                        <div className="flex gap-0.5">
                            <span>{pair?.token0.symbol}</span>
                            <span>-</span>
                            <span>{pair?.token1.symbol}</span>
                        </div>
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="h-[calc(100%-2.5rem)]">
                <iframe
                    src={`http://localhost:5000?symbol=${symbol}`}
                    width="100%"
                    height="100%"
                />
            </div>
        </div>
    )
}

export default withPair(TVChartContainer)
