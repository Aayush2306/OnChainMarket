import { useState, useCallback } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { api } from "@/lib/api";

export function useEVMWalletAuth() {
  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const getSignature = useCallback(async (): Promise<{ walletAddress: string; signature: string; chainType: "evm" } | null> => {
    setError(null);
    setIsSigning(true);

    try {
      if (!address) {
        setError("Wallet not connected");
        return null;
      }

      const { message } = await api.getNonce(address);

      const signature = await signMessageAsync({ message });

      return { walletAddress: address, signature, chainType: "evm" as const };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign message";
      setError(errorMessage);
      return null;
    } finally {
      setIsSigning(false);
    }
  }, [address, signMessageAsync]);

  const disconnectWallet = useCallback(async () => {
    try {
      disconnect();
    } catch {
    }
  }, [disconnect]);

  return {
    publicKey: address || null,
    connected: isConnected,
    connecting: isConnecting,
    isSigning,
    error,
    walletName: "EVM Wallet",
    chainType: "evm" as const,
    getSignature,
    disconnectWallet,
  };
}
