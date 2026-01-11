import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  connect: () => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

export function usePhantom() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    const checkPhantom = () => {
      setIsPhantomInstalled(!!window.phantom?.solana?.isPhantom);
    };
    
    checkPhantom();
    
    // Check again after a delay in case Phantom loads slowly
    const timeout = setTimeout(checkPhantom, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const getProvider = useCallback((): PhantomProvider | null => {
    if (typeof window === "undefined") return null;
    if (window.phantom?.solana?.isPhantom) {
      return window.phantom.solana;
    }
    return null;
  }, []);

  const connectAndSign = useCallback(async (): Promise<{ walletAddress: string; signature: string; message: string } | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = getProvider();
      
      if (!provider) {
        setError("Phantom wallet not found. Please install it.");
        window.open("https://phantom.app/", "_blank");
        return null;
      }

      // Connect to Phantom
      const { publicKey } = await provider.connect();
      const walletAddress = publicKey.toString();

      // Get nonce from backend
      const { message } = await api.getNonce(walletAddress);

      // Sign the message
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encodedMessage, "utf8");

      // Convert signature to base64
      const signatureBase64 = btoa(String.fromCharCode(...signature));

      return { walletAddress, signature: signatureBase64, message };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider]);

  const signMessage = useCallback(async (walletAddress: string): Promise<string | null> => {
    setError(null);

    try {
      const provider = getProvider();
      if (!provider) {
        setError("Phantom wallet not found");
        return null;
      }

      // Get new nonce from backend
      const { message } = await api.getNonce(walletAddress);

      // Sign the message
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encodedMessage, "utf8");

      // Convert signature to base64
      return btoa(String.fromCharCode(...signature));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign message";
      setError(errorMessage);
      return null;
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    if (provider) {
      try {
        await provider.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
  }, [getProvider]);

  return {
    isPhantomInstalled,
    isConnecting,
    error,
    connectAndSign,
    signMessage,
    disconnect,
    getProvider,
  };
}
