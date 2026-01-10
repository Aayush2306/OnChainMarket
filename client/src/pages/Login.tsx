import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePhantom } from "@/hooks/usePhantom";
import { OnboardingModal } from "@/components/OnboardingModal";
import { Wallet, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

export default function Login() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, login, setNeedsOnboarding, needsOnboarding, setWalletAddress, walletAddress } = useAuth();
  const { isPhantomInstalled, isConnecting, error, connectAndSign } = usePhantom();
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleConnect = async () => {
    setLoginError(null);
    const result = await connectAndSign();
    
    if (!result) return;

    setWalletAddress(result.walletAddress);
    setPendingSignature(result.signature);

    try {
      await login(result.walletAddress, result.signature);
      setLocation("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      
      if (message.includes("Name and username required")) {
        setNeedsOnboarding(true);
      } else {
        setLoginError(message);
      }
    }
  };

  const handleOnboardingComplete = async (name: string, username: string) => {
    if (!walletAddress || !pendingSignature) return;

    try {
      const nonceResponse = await api.getNonce(walletAddress);
      
      const provider = window.phantom?.solana;
      if (!provider) throw new Error("Phantom not found");

      const encodedMessage = new TextEncoder().encode(nonceResponse.message);
      const { signature } = await provider.signMessage(encodedMessage, "utf8");
      const signatureBase64 = btoa(String.fromCharCode(...signature));

      await login(walletAddress, signatureBase64, name, username);
      setLocation("/");
    } catch (err) {
      throw err;
    }
  };

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
            Sign in with your Phantom wallet to start predicting
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isPhantomInstalled ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Phantom Wallet Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Install Phantom wallet to connect and start betting
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                className="w-full gap-2"
                onClick={() => window.open("https://phantom.app/", "_blank")}
                data-testid="button-install-phantom"
              >
                <ExternalLink className="h-4 w-4" />
                Install Phantom
              </Button>
            </div>
          ) : (
            <>
              <Button
                className="w-full h-12 gap-2 text-base"
                onClick={handleConnect}
                disabled={isConnecting}
                data-testid="button-connect-wallet"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect Phantom Wallet
                  </>
                )}
              </Button>

              {(error || loginError) && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error || loginError}
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t border-border">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs text-primary font-medium">1</span>
                Connect your Phantom wallet
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
