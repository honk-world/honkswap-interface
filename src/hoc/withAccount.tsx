import Lottie from 'lottie-react'
import loadingCircle from '../animation/loading-circle.json'
import useActiveWeb3React from '../hooks/useActiveWeb3React'

export interface WithAccountProps {
    account: string
}

const withAccount =
    (Component) =>
    ({ ...props }) => {
        const { account } = useActiveWeb3React()
        return <Component account={account} {...props} />
    }

export default withAccount
