import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "@/lib/api";

export function useWalletAuth() {
  const { publicKey, signMessage, connected, connecting, disconnect, wallet } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const getSignature = useCallback(async (): Promise<{ walletAddress: string; signature: string; chainType: "solana" } | null> => {
    setError(null);
    setIsSigning(true);

    try {
      if (!publicKey || !signMessage) {
        setError("Wallet not connected or doesn't support message signing");
        return null;
      }

      const walletAddress = publicKey.toBase58();

      const { message } = await api.getNonce(walletAddress);

      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);

      const signatureBase64 = btoa(String.fromCharCode.apply(null, Array.from(signatureBytes)));

      return { walletAddress, signature: signatureBase64, chainType: "solana" as const };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign message";
      setError(errorMessage);
      return null;
    } finally {
      setIsSigning(false);
    }
  }, [publicKey, signMessage]);

  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch {
    }
  }, [disconnect]);

  return {
    publicKey: publicKey?.toBase58() || null,
    connected,
    connecting,
    isSigning,
    error,
    walletName: wallet?.adapter?.name || null,
    chainType: "solana" as const,
    getSignature,
    disconnectWallet,
  };
}
