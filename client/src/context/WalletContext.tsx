import { useMemo, createContext, useContext, useState, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { EVMWalletProvider } from "./EVMWalletContext";

import "@solana/wallet-adapter-react-ui/styles.css";

type ChainType = "solana" | "evm";

interface ChainContextType {
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
}

const ChainContext = createContext<ChainContextType>({
  selectedChain: "solana",
  setSelectedChain: () => {},
});

export function useChainContext() {
  return useContext(ChainContext);
}

interface MultiChainWalletProviderProps {
  children: ReactNode;
}

export function MultiChainWalletProvider({ children }: MultiChainWalletProviderProps) {
  const [selectedChain, setSelectedChain] = useState<ChainType>("solana");
  const endpoint = useMemo(() => clusterApiUrl("mainnet-beta"), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      <EVMWalletProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect={false}>
            <WalletModalProvider>
              {children}
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </EVMWalletProvider>
    </ChainContext.Provider>
  );
}

export { ChainContext };
export type { ChainType };
