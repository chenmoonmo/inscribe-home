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
        mode="light"
        theme="nouns"
        customTheme={{
          "--ck-overlay-background": "rgba(0,0,0,0.3)",
        }}
      >
        <Theme appearance="light" accentColor="violet">
          <TransactionDialogProvider>{children}</TransactionDialogProvider>
        </Theme>
      </ConnectKitProvider>
    </WagmiConfig>
  );
});

Providers.displayName = "Providers";
