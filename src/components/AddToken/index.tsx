import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import React from 'react'
import { useActiveWeb3React } from '../../hooks'
import QuestionHelper from '../QuestionHelper'
import Image from 'next/image'

export interface MetamaskTokenInfo {
  address: string,
  symbol: string,
  decimals: number,
  image: string,
}

export interface ImageProps {
  src?: string,
  alt?: string,
  width?: string,
  height?: string,
  objectFit?: string
  className?: string,
}

export interface AddTokenProps {
  metamaskProps: MetamaskTokenInfo,
  text: string,
  imageProps: ImageProps,
}

const defaultImageProps: ImageProps = {
  src: "",
  alt: "",
  width: "38px",
  height: "38px",
  objectFit: "contain",
  className: "rounded-md",
}

function AddToken({ imageProps, text, metamaskProps }: AddTokenProps & React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  imageProps = { ...defaultImageProps, ...imageProps }
  const { i18n } = useLingui()
  const { library } = useActiveWeb3React()

  return (
  <QuestionHelper text={text}>
    <div
      className="p-0.5 rounded-md cursor-pointer sm:inline-flex bg-dark-900 hover:bg-dark-800"
      onClick={() => {
        if (library && library.provider.isMetaMask && library.provider.request) {
          const params: any = {
            type: 'ERC20',
            options: metamaskProps,
          }
          library.provider
            .request({
              method: 'wallet_watchAsset',
              params,
            })
            .then((success) => {
              if (success) {
                console.log(`Successfully added ${metamaskProps.symbol} to MetaMask`)
              } else {
                throw new Error('Something went wrong.')
              }
            })
            .catch(console.error)
        }
      }}
    >
      <Image
        src={imageProps.src}
        alt={imageProps.alt}
        width={imageProps.width}
        height={imageProps.height}
        objectFit={imageProps.objectFit as any}
        className={imageProps.className}
      />
    </div>
  </QuestionHelper>
)
}

export default AddToken
