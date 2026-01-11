import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Wallet, Loader2 } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Login() {
  const { isAuthenticated, login, setNeedsOnboarding, needsOnboarding, setWalletAddress, walletAddress } = useAuth();
  const { connected, connecting, isSigning, error, getSignature, disconnectWallet, publicKey } = useWalletAuth();
  const { setVisible } = useWalletModal();
  const { disconnect } = useWallet();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleWalletConnection = async () => {
      if (connected && publicKey && !isAuthenticated && !isLoggingIn && !needsOnboarding) {
        setIsLoggingIn(true);
        setLoginError(null);
        
        try {
          const result = await getSignature();
          
          if (!result) {
            setIsLoggingIn(false);
            return;
          }

          setWalletAddress(result.walletAddress);

          try {
            await login(result.walletAddress, result.signature);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            
            if (message.includes("Name and username required")) {
              setNeedsOnboarding(true);
            } else if (message.includes("No active login session") || message.includes("Invalid signature")) {
              setLoginError("Session expired. Please try connecting again.");
              await disconnect();
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

    handleWalletConnection();
  }, [connected, publicKey, isAuthenticated, isLoggingIn, needsOnboarding]);

  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  const handleConnect = () => {
    setLoginError(null);
    setVisible(true);
  };

  const handleOnboardingComplete = async (name: string, username: string) => {
    if (!walletAddress) return;

    const result = await getSignature();
    if (!result) {
      throw new Error("Failed to sign message");
    }

    await login(walletAddress, result.signature, name, username);
  };

  const isProcessing = connecting || isSigning || isLoggingIn;

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
            Sign in with your Solana wallet to start predicting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 gap-2 text-base"
            onClick={handleConnect}
            disabled={isProcessing}
            data-testid="button-connect-wallet"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {connecting ? "Connecting..." : isSigning ? "Signing..." : "Logging in..."}
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </>
            )}
          </Button>

          {(error || loginError) && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error || loginError}
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground">
            Supports Phantom, Solflare, and other Solana wallets
          </div>

          <div className="pt-4 border-t border-border">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">1</span>
                Connect your Solana wallet
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
