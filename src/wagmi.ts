import { getDefaultConfig } from "connectkit";
import { base } from "viem/chains";
import { createConfig } from "wagmi";

const walletConnectProjectId = "5b47312331baf1b7f1fc093e03e7ce89";

export const chains = [base];

export const config = createConfig(
  getDefaultConfig({
    chains,
    autoConnect: true,
    appName: "My wagmi + ConnectKit App",
    walletConnectProjectId,
  })
);
