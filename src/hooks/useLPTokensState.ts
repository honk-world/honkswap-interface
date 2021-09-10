import { ChainId, Token, TokenAmount } from "@mistswapdex/sdk";
import {
  useBoringHelperContract,
  useDashboardContract,
  useQuickSwapFactoryContract,
} from "../hooks/useContract";
import { useCallback, useEffect, useRef, useState } from "react";

import { getAddress } from "@ethersproject/address";
import { useActiveWeb3React } from "../hooks/useActiveWeb3React";

import { ethers } from "ethers";

export interface LPToken {
  id?: number;
  address: string;
  tokenA: Token;
  tokenB: Token;
  totalSupply: ethers.BigNumber;
  balance: TokenAmount;
  name?: string;
  symbol?: string;
  decimals?: number;
  version?: "v1" | "v2";
}

export interface LPTokensState {
  updateLPTokens: () => Promise<void>;
  lpTokens: LPToken[];
  selectedLPToken?: LPToken;
  setSelectedLPToken: (token?: LPToken) => void;
  selectedLPTokenAllowed: boolean;
  setSelectedLPTokenAllowed: (allowed: boolean) => void;
  loading: boolean;
  updatingLPTokens: boolean;
}

const useLPTokensState = () => {
  const { account, chainId } = useActiveWeb3React();
  const boringHelperContract = useBoringHelperContract();
  const dashboardContract = useDashboardContract();
  const quickSwapFactoryContract = useQuickSwapFactoryContract();
  const [lpTokens, setLPTokens] = useState<LPToken[]>([]);
  const [selectedLPToken, setSelectedLPToken] = useState<LPToken>();
  const [selectedLPTokenAllowed, setSelectedLPTokenAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const updatingLPTokens = useRef(false);
  const updateLPTokens = useCallback(async () => {
    try {
      updatingLPTokens.current = true;
      if (chainId && [ChainId.SMARTBCH].includes(chainId)) {
        const requests: any = {
          [ChainId.SMARTBCHMAINNET]: [
            `https://api.covalenthq.com/v1/${ChainId.SMARTBCHMAINNET}/address/${String(
              account
            ).toLowerCase()}/stacks/uniswap_v2/balances/?key=ckey_cba3674f2ce5450f9d5dd290589`,
          ],
        };

        const responses: any = await Promise.all(
          requests[chainId].map((request: any) => fetch(request))
        );

        let userLP = [];

        if (chainId === ChainId.SMARTBCH) {
          const { data } = await responses[0].json();
          userLP = data?.["uniswap_v2"]?.balances
            ?.filter((balance: any) => balance.pool_token.balance !== "0")
            .map((balance: any) => ({
              ...balance,
              version: "v2",
            }));
        }

        const tokenDetails = (
          await dashboardContract?.getTokenInfo(
            Array.from(
              new Set(
                userLP?.reduce(
                  (a: any, b: any) =>
                    a.push(
                      b.pool_token.contract_address,
                      b.token_0.contract_address,
                      b.token_1.contract_address
                    ) && a,
                  []
                )
              )
            )
          )
        )?.reduce((acc: any, cur: any) => {
          acc[cur[0]] = cur;
          return acc;
        }, {});

        const lpTokens = userLP?.map((pair: any, index: number) => {
          const token = new Token(
            chainId as ChainId,
            getAddress(pair.pool_token.contract_address),
            tokenDetails[getAddress(pair.pool_token.contract_address)].decimals,
            tokenDetails[getAddress(pair.pool_token.contract_address)].symbol,
            tokenDetails[getAddress(pair.pool_token.contract_address)].name
          );
          const tokenA =
            tokenDetails[getAddress(pair.token_0.contract_address)];
          const tokenB =
            tokenDetails[getAddress(pair.token_1.contract_address)];

          return {
            address: getAddress(pair.pool_token.contract_address),
            decimals: token.decimals,
            name: `${tokenA.symbol}-${tokenB.symbol} LP Token`,
            symbol: `${tokenA.symbol}-${tokenB.symbol}`,
            balance: new TokenAmount(token, pair.pool_token.balance),
            totalSupply: pair.pool_token.total_supply,
            tokenA: new Token(
              chainId as ChainId,
              tokenA.token,
              tokenA.decimals,
              tokenA.symbol,
              tokenA.name
            ),
            tokenB: new Token(
              chainId as ChainId,
              tokenB.token,
              tokenB.decimals,
              tokenB.symbol,
              tokenB.name
            ),
            version: pair.version,
          } as LPToken;
        });
        if (lpTokens) {
          setLPTokens(lpTokens);
        }
      }
    } finally {
      setLoading(false);
      updatingLPTokens.current = false;
    }
  }, [
    chainId,
    account,
    boringHelperContract,
    dashboardContract,
    quickSwapFactoryContract,
  ]);

  useEffect(() => {
    if (
      chainId &&
      account &&
      boringHelperContract &&
      !updatingLPTokens.current
    ) {
      updateLPTokens();
    }
  }, [account, chainId, boringHelperContract, updateLPTokens]);

  return {
    updateLPTokens,
    lpTokens,
    selectedLPToken,
    setSelectedLPToken,
    selectedLPTokenAllowed,
    setSelectedLPTokenAllowed,
    loading,
    updatingLPTokens: updatingLPTokens.current,
  };
};

export default useLPTokensState;
