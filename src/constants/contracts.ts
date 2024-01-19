import { Address } from "viem";
import { goerli } from "viem/chains";

export const CONTRACTS: {
  [chainId: number]: {
    inscription: Address;
  };
} = {
  [goerli.id]: {
    inscription: process.env.NEXT_PUBLIC_GOERLI_INSCRIPTION as Address,
  },
};
