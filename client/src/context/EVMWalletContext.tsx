import { type ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, arbitrum, optimism, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const WALLET_CONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";

const config = getDefaultConfig({
  appName: "On-Chain Market",
  projectId: WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: false,
});

const queryClient = new QueryClient();

interface EVMWalletProviderProps {
  children: ReactNode;
}

export function EVMWalletProvider({ children }: EVMWalletProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: "#8B5CF6",
              accentColorForeground: "white",
              borderRadius: "medium",
            }),
            darkMode: darkTheme({
              accentColor: "#8B5CF6",
              accentColorForeground: "white",
              borderRadius: "medium",
            }),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
