import { ChainId, Token, CurrencyAmount } from "@mistswapdex/sdk";
import { BENSWAP_TOKENS } from '../config/tokens'
import { useTokenBalances } from '../state/wallet/hooks'
import { useCallback, useEffect, useRef, useState } from "react";

import { useActiveWeb3React } from "../hooks/useActiveWeb3React";
import { getAddress } from "@ethersproject/address";
import { isAddress } from '../functions/validate'

import { ethers } from "ethers";

export interface LPToken {
  id?: number;
  address: string;
  tokenA: Token;
  tokenB: Token;
  balance: CurrencyAmount<Currency>;
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
  const [lpTokens, setLPTokens] = useState<LPToken[]>([]);
  const [selectedLPToken, setSelectedLPToken] = useState<LPToken>();
  const [selectedLPTokenAllowed, setSelectedLPTokenAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const updatingLPTokens = useRef(false);

  const relevantTokenBalances = useTokenBalances(account ?? undefined, BENSWAP_TOKENS[chainId])

  const updateLPTokens = useCallback(async () => {
    try {
      updatingLPTokens.current = true;

      const lpTokens: LPToken[] = [];

      for (const [address, obj] of Object.entries(relevantTokenBalances)) {
        let data = {
          address: getAddress(address),
          decimals: obj.currency.decimals,
          name: obj.currency.name,
          symbol: obj.currency.symbol,
          balance: obj as CurrencyAmount<Token>,
          version: "v2",
        } as LPToken;

        const benswapPairs = {
          [ChainId.SMARTBCH]: {
          },
          [ChainId.SMARTBCH_AMBER]: {
            '0x842692f8A4D0743e942dF5D52155a037327d4f3f': {
              tokenA: new Token(chainId as ChainId, '0x77beB0D017C743eCa0d22951A3b051A17D50f108', 18, 'EBEN', 'EBEN'),
              tokenB: new Token(chainId as ChainId, '0x17F4FCF5b6E0A95D4eE331c8529041896A073F9b', 18, 'BCH', 'BCH'),
            },
          },
        }

        if (benswapPairs[chainId] && benswapPairs[chainId][address]) {
          console.log('PAIR FOUND')
          data.tokenA = benswapPairs[chainId][address].tokenA;
          data.tokenB = benswapPairs[chainId][address].tokenB;
        }

        lpTokens.push(data)
      }

      setLPTokens(lpTokens);
    } finally {
      setLoading(false);
      updatingLPTokens.current = false;
    }
  }, [
    chainId,
    account,
  ]);

  useEffect(() => {
    if (
      chainId &&
      account &&
      !updatingLPTokens.current
    ) {
      updateLPTokens();
    }
  }, [account, chainId, updateLPTokens]);

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
