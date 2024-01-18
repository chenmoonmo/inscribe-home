import { goerli } from "viem/chains";

export const CONTRACTS: {
  [chainId: number]: {
    LiquidityLaunchpad: string;
  };
} = {
  [goerli.id]: {
    LiquidityLaunchpad: process.env.NEXT_PUBLIC_GOERLI_LIQ_LAUNCHPAD as string,
  },
};
