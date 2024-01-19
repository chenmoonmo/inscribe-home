import { getDefaultConfig } from "connectkit";
import { goerli } from "viem/chains";
import { createConfig } from "wagmi";

const walletConnectProjectId = "5b47312331baf1b7f1fc093e03e7ce89";

export const chains = [goerli];

export const config = createConfig(
  getDefaultConfig({
    chains,
    autoConnect: true,
    appName: "My wagmi + ConnectKit App",
    walletConnectProjectId,
  })
);
