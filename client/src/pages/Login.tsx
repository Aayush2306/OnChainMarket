import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useEVMWalletAuth } from "@/hooks/useEVMWalletAuth";
import { useChainContext, type ChainType } from "@/context/WalletContext";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Wallet, Loader2 } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Login() {
  const { isAuthenticated, login, setNeedsOnboarding, needsOnboarding, setWalletAddress, walletAddress } = useAuth();
  const { selectedChain, setSelectedChain } = useChainContext();
  
  const solanaWallet = useWalletAuth();
  const evmWallet = useEVMWalletAuth();
  const { setVisible } = useWalletModal();
  const { disconnect: disconnectSolana } = useWallet();
  const { isConnected: evmConnected, address: evmAddress } = useAccount();
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasTriedEVMLogin, setHasTriedEVMLogin] = useState(false);

  useEffect(() => {
    const handleSolanaConnection = async () => {
      if (
        selectedChain === "solana" &&
        solanaWallet.connected && 
        solanaWallet.publicKey && 
        !isAuthenticated && 
        !isLoggingIn && 
        !needsOnboarding
      ) {
        setIsLoggingIn(true);
        setLoginError(null);
        
        try {
          const result = await solanaWallet.getSignature();
          
          if (!result) {
            setIsLoggingIn(false);
            return;
          }

          setWalletAddress(result.walletAddress);

          try {
            await login(result.walletAddress, result.signature, undefined, undefined, result.chainType);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            
            if (message.includes("Name and username required")) {
              setNeedsOnboarding(true);
            } else if (message.includes("No active login session") || message.includes("Invalid signature")) {
              setLoginError("Session expired. Please try connecting again.");
              await disconnectSolana();
            } else {
              setLoginError(message);
            }
          }
        } catch (err) {
          setLoginError(err instanceof Error ? err.message : "Connection failed");
        } finally {
          setIsLoggingIn(false);
        }
      }
    };

    handleSolanaConnection();
  }, [selectedChain, solanaWallet.connected, solanaWallet.publicKey, isAuthenticated, isLoggingIn, needsOnboarding]);

  useEffect(() => {
    const handleEVMConnection = async () => {
      if (
        selectedChain === "evm" &&
        evmConnected && 
        evmAddress && 
        !isAuthenticated && 
        !isLoggingIn && 
        !needsOnboarding &&
        !hasTriedEVMLogin
      ) {
        setIsLoggingIn(true);
        setLoginError(null);
        setHasTriedEVMLogin(true);
        
        try {
          const result = await evmWallet.getSignature();
          
          if (!result) {
            setIsLoggingIn(false);
            return;
          }

          setWalletAddress(result.walletAddress);

          try {
            await login(result.walletAddress, result.signature, undefined, undefined, result.chainType);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            
            if (message.includes("Name and username required")) {
              setNeedsOnboarding(true);
            } else if (message.includes("No active login session") || message.includes("Invalid signature")) {
              setLoginError("Session expired. Please try connecting again.");
              await evmWallet.disconnectWallet();
            } else {
              setLoginError(message);
            }
          }
        } catch (err) {
          setLoginError(err instanceof Error ? err.message : "Connection failed");
        } finally {
          setIsLoggingIn(false);
        }
      }
    };

    handleEVMConnection();
  }, [selectedChain, evmConnected, evmAddress, isAuthenticated, isLoggingIn, needsOnboarding, hasTriedEVMLogin]);

  useEffect(() => {
    if (!evmConnected) {
      setHasTriedEVMLogin(false);
    }
  }, [evmConnected]);

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleSolanaConnect = () => {
    setLoginError(null);
    setSelectedChain("solana");
    setVisible(true);
  };

  const handleChainSelect = (chain: ChainType) => {
    setSelectedChain(chain);
    setLoginError(null);
  };

  const handleOnboardingComplete = async (name: string, username: string) => {
    if (!walletAddress) return;

    let result;
    if (selectedChain === "solana") {
      result = await solanaWallet.getSignature();
    } else {
      result = await evmWallet.getSignature();
    }
    
    if (!result) {
      throw new Error("Failed to sign message");
    }

    await login(walletAddress, result.signature, name, username, result.chainType);
  };

  const isSolanaProcessing = solanaWallet.connecting || solanaWallet.isSigning || (isLoggingIn && selectedChain === "solana");
  const isEVMProcessing = evmWallet.connecting || evmWallet.isSigning || (isLoggingIn && selectedChain === "evm");
  const error = solanaWallet.error || evmWallet.error || loginError;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <Card className="relative w-full max-w-md animate-slide-up">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2 shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-display">Connect Wallet</CardTitle>
          <CardDescription>
            Sign in with your crypto wallet to start predicting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedChain === "solana" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleChainSelect("solana")}
              data-testid="button-chain-solana"
            >
              Solana
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                selectedChain === "evm" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleChainSelect("evm")}
              data-testid="button-chain-evm"
            >
              Ethereum
            </button>
          </div>

          {selectedChain === "solana" ? (
            <Button
              className="w-full h-12 gap-2 text-base"
              onClick={handleSolanaConnect}
              disabled={isSolanaProcessing}
              data-testid="button-connect-solana"
            >
              {isSolanaProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {solanaWallet.connecting ? "Connecting..." : solanaWallet.isSigning ? "Signing..." : "Logging in..."}
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5" />
                  Connect Solana Wallet
                </>
              )}
            </Button>
          ) : (
            <div className="w-full" data-testid="button-connect-evm">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {!connected ? (
                        <Button
                          className="w-full h-12 gap-2 text-base"
                          onClick={openConnectModal}
                          disabled={isEVMProcessing}
                        >
                          {isEVMProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {evmWallet.connecting ? "Connecting..." : evmWallet.isSigning ? "Signing..." : "Logging in..."}
                            </>
                          ) : (
                            <>
                              <Wallet className="h-5 w-5" />
                              Connect Ethereum Wallet
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{account.displayName}</div>
                            <div className="text-xs text-muted-foreground">{chain.name}</div>
                          </div>
                          {isEVMProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                        </div>
                      )}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            {selectedChain === "solana" 
              ? "Supports Phantom, Solflare, and other Solana wallets"
              : "Supports MetaMask, Rainbow, Coinbase Wallet, and more"
            }
          </div>

          <div className="pt-4 border-t border-border">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">1</span>
                Connect your crypto wallet
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">2</span>
                Sign a message to verify ownership
              </p>
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">3</span>
                Get 1,000 free credits to start
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <OnboardingModal
        open={needsOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
