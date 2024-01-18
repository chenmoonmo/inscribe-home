"use client";

import * as React from "react";
import { ConnectKitProvider } from "connectkit";
import { Theme } from "@radix-ui/themes";
import { WagmiConfig } from "wagmi";
import { TransactionDialogProvider } from "@/components/transaction-provider";
import "@radix-ui/themes/styles.css";

import { config } from "../wagmi";

type ProviderProps = {
  children: React.ReactNode;
  chainIds?: number[];
};

export const Providers = React.memo(({ children }: ProviderProps) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider
        mode="dark"
        customTheme={{
          "--ck-connectbutton-background": "#1F2127",
          "--ck-connectbutton-border-radius": "6px",
          "--ck-connectbutton-box-shadow": "inset 0 0 0 1px #363A45",
          "--ck-connectbutton-color": "#737884",
        }}
      >
        <Theme appearance="dark" accentColor="blue">
          <TransactionDialogProvider>{children}</TransactionDialogProvider>
        </Theme>
      </ConnectKitProvider>
    </WagmiConfig>
  );
});

Providers.displayName = "Providers";
