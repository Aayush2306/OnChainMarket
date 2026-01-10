import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useSocket } from "@/context/SocketContext";
import { CRYPTO_MAP, type CryptoRound } from "@shared/schema";
import { TradingViewChart } from "@/components/TradingViewChart";
import { LiveBets } from "@/components/LiveBets";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins,
  Loader2,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

import btcLogo from "@/assets/coins/btc.svg";
import ethLogo from "@/assets/coins/eth.svg";
import solLogo from "@/assets/coins/sol.svg";
import bnbLogo from "@/assets/coins/bnb.svg";
import xrpLogo from "@/assets/coins/xrp.svg";
import adaLogo from "@/assets/coins/ada.svg";
import dogeLogo from "@/assets/coins/doge.svg";
import maticLogo from "@/assets/coins/matic.svg";
import dotLogo from "@/assets/coins/dot.svg";
import avaxLogo from "@/assets/coins/avax.svg";

const coinLogos: Record<string, string> = {
  BTC: btcLogo,
  ETH: ethLogo,
  SOL: solLogo,
  BNB: bnbLogo,
  XRP: xrpLogo,
  ADA: adaLogo,
  DOGE: dogeLogo,
  MATIC: maticLogo,
  DOT: dotLogo,
  AVAX: avaxLogo,
};

export default function CryptoDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const upperSymbol = symbol?.toUpperCase() || "";
  const name = CRYPTO_MAP[upperSymbol as keyof typeof CRYPTO_MAP] || upperSymbol;
  const logo = coinLogos[upperSymbol];
  
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { joinRoom, leaveRoom, isConnected } = useSocket();
  const [amount, setAmount] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<"up" | "down" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (isConnected && upperSymbol) {
      joinRoom(upperSymbol);
    }
    return () => {
      if (upperSymbol) {
        leaveRoom(upperSymbol);
      }
    };
  }, [isConnected, upperSymbol, joinRoom, leaveRoom]);

  const { data: round, isLoading } = useQuery<CryptoRound | null>({
    queryKey: ["/api/rounds", upperSymbol],
    queryFn: async () => {
      try {
        const data = await api.getCurrentRound(upperSymbol);
        if ("waiting" in (data as object)) return null;
        return data as CryptoRound;
      } catch {
        return null;
      }
    },
    refetchInterval: isConnected ? 30000 : 5000,
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({ roundId, direction, betAmount }: { roundId: number; direction: string; betAmount: number }) => {
      return api.placeBet(roundId, upperSymbol, direction, betAmount);
    },
    onSuccess: () => {
      toast({ title: "Bet placed successfully!" });
      setAmount("");
      setSelectedDirection(null);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", upperSymbol] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-bets", round?.id, upperSymbol] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to place bet";
      toast({ title: message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!round) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = round.end_time - now;
      setTimeLeft(Math.max(0, remaining));
      
      // When round ends, immediately fetch new round
      if (remaining <= 0) {
        queryClient.invalidateQueries({ queryKey: ["/api/rounds", upperSymbol] });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [round, upperSymbol]);

  const handlePlaceBet = async () => {
    if (!round || !selectedDirection || !amount) return;

    const betAmount = parseInt(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (user && betAmount > user.credits) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    placeBetMutation.mutate({ roundId: round.id, direction: selectedDirection, betAmount });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/crypto">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Crypto
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          {logo && <img src={logo} alt={upperSymbol} className="h-12 w-12" />}
          <div>
            <h1 className="text-3xl font-bold font-display">{upperSymbol}</h1>
            <p className="text-muted-foreground">{name}</p>
          </div>
          {round && (
            <Badge 
              variant={isExpired ? "destructive" : timeLeft < 10 ? "destructive" : "secondary"}
              className={`ml-auto text-lg px-4 py-2 ${timeLeft < 10 && !isExpired ? "animate-countdown-pulse" : ""}`}
            >
              <Clock className="h-4 w-4 mr-2" />
              {isExpired ? "Round Ended" : formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <TradingViewChart symbol={upperSymbol} type="crypto" />
              </CardContent>
            </Card>

            <LiveBets roundId={round?.id || null} crypto={upperSymbol} />
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !round ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                  <p>Waiting for next round...</p>
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="betting-panel">
                <CardHeader>
                  <CardTitle>Place Your Bet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Start Price</p>
                    <p className="text-4xl font-bold font-mono tabular-nums">
                      ${round.start_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedDirection === "up" ? "default" : "outline"}
                      className={`h-16 flex-col gap-2 ${selectedDirection === "up" ? "bg-win hover:bg-win/90 border-win" : ""}`}
                      onClick={() => setSelectedDirection("up")}
                      disabled={isExpired}
                      data-testid="button-up"
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span>UP</span>
                    </Button>
                    <Button
                      variant={selectedDirection === "down" ? "default" : "outline"}
                      className={`h-16 flex-col gap-2 ${selectedDirection === "down" ? "bg-loss hover:bg-loss/90 border-loss" : ""}`}
                      onClick={() => setSelectedDirection("down")}
                      disabled={isExpired}
                      data-testid="button-down"
                    >
                      <TrendingDown className="h-6 w-6" />
                      <span>DOWN</span>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-warning" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono text-lg"
                        disabled={isExpired}
                        data-testid="input-amount"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 50, 100, 500].map((val) => (
                        <Button
                          key={val}
                          variant="outline"
                          size="sm"
                          onClick={() => setAmount(val.toString())}
                          disabled={isExpired}
                        >
                          {val}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setAmount(user?.credits?.toString() || "0")}
                      disabled={isExpired}
                    >
                      MAX ({user?.credits?.toLocaleString() || 0})
                    </Button>
                  </div>

                  <Button
                    className="w-full h-12 text-lg"
                    disabled={!selectedDirection || !amount || isExpired || placeBetMutation.isPending}
                    onClick={handlePlaceBet}
                    data-testid="button-place-bet"
                  >
                    {placeBetMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Placing Bet...
                      </>
                    ) : (
                      "Place Bet"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your Balance</span>
                  <span className="font-mono font-semibold flex items-center gap-1">
                    <Coins className="h-4 w-4 text-warning" />
                    {user?.credits?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
