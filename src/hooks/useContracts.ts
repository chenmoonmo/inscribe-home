import { useMemo } from "react";
import { useNetwork } from "wagmi";
import { CONTRACTS } from "../constants/contracts";

export const useContracts = () => {
  const { chain } = useNetwork();
  return useMemo(() => chain && CONTRACTS[chain?.id], [chain]);
};
