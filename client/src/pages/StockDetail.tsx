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
import { STOCK_MAP, type CryptoRound } from "@shared/schema";
import { TradingViewChart } from "@/components/TradingViewChart";
import { LiveBets } from "@/components/LiveBets";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins,
  Loader2,
  ArrowLeft,
  Building2
} from "lucide-react";

import appleLogo from "@/assets/coins/apple.svg";
import googleLogo from "@/assets/coins/google.svg";
import teslaLogo from "@/assets/coins/tesla.svg";
import microsoftLogo from "@/assets/coins/microsoft.svg";
import amazonLogo from "@/assets/coins/amazon.svg";
import metaLogo from "@/assets/coins/meta.svg";
import netflixLogo from "@/assets/coins/netflix.svg";
import nvidiaLogo from "@/assets/coins/nvidia.svg";

const stockLogos: Record<string, string> = {
  AAPL: appleLogo,
  GOOGL: googleLogo,
  TSLA: teslaLogo,
  MSFT: microsoftLogo,
  AMZN: amazonLogo,
  META: metaLogo,
  NFLX: netflixLogo,
  NVDA: nvidiaLogo,
};

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const upperSymbol = symbol?.toUpperCase() || "";
  const name = STOCK_MAP[upperSymbol as keyof typeof STOCK_MAP] || upperSymbol;
  const logo = stockLogos[upperSymbol];
  
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
    staleTime: 30000,
    refetchInterval: isConnected ? false : 5000,
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
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="min-h-screen py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/stocks">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Stocks
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            {logo ? (
              <img src={logo} alt={upperSymbol} className="h-10 w-10 sm:h-12 sm:w-12" />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display">{upperSymbol}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{name}</p>
            </div>
          </div>
          {round && (
            <Badge 
              variant={isExpired ? "destructive" : "secondary"}
              className="self-start sm:ml-auto text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2"
            >
              <Clock className="h-4 w-4 mr-2" />
              {isExpired ? "Market Closed" : formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="h-[300px] sm:h-[400px] lg:h-[500px]">
                  <TradingViewChart symbol={upperSymbol} type="stock" />
                </div>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <LiveBets roundId={round?.id || null} crypto={upperSymbol} />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !round ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Market Closed</p>
                  <p className="text-sm">Opens Mon-Fri 9:30 AM EST</p>
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="betting-panel">
                <CardHeader className="pb-2 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Place Your Bet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="text-center py-3 sm:py-4 rounded-lg bg-muted/50">
                    <p className="text-xs sm:text-sm text-muted-foreground">Opening Price</p>
                    <p className="text-2xl sm:text-4xl font-bold font-mono tabular-nums">
                      ${round.start_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant={selectedDirection === "up" ? "default" : "outline"}
                      className={`h-14 sm:h-16 flex-col gap-1 sm:gap-2 touch-manipulation ${selectedDirection === "up" ? "bg-win hover:bg-win/90 border-win" : ""}`}
                      onClick={() => setSelectedDirection("up")}
                      disabled={isExpired}
                      data-testid="button-higher"
                    >
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-sm sm:text-base">HIGHER</span>
                    </Button>
                    <Button
                      variant={selectedDirection === "down" ? "default" : "outline"}
                      className={`h-14 sm:h-16 flex-col gap-1 sm:gap-2 touch-manipulation ${selectedDirection === "down" ? "bg-loss hover:bg-loss/90 border-loss" : ""}`}
                      onClick={() => setSelectedDirection("down")}
                      disabled={isExpired}
                      data-testid="button-lower"
                    >
                      <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span className="text-sm sm:text-base">LOWER</span>
                    </Button>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-warning shrink-0" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="font-mono text-base sm:text-lg"
                        disabled={isExpired}
                        data-testid="input-amount"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                      {[10, 50, 100, 500].map((val) => (
                        <Button
                          key={val}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm touch-manipulation"
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
                      className="w-full text-xs sm:text-sm touch-manipulation"
                      onClick={() => setAmount(user?.credits?.toString() || "0")}
                      disabled={isExpired}
                    >
                      MAX ({user?.credits?.toLocaleString() || 0})
                    </Button>
                  </div>

                  <Button
                    className="w-full h-11 sm:h-12 text-base sm:text-lg touch-manipulation"
                    disabled={!selectedDirection || !amount || isExpired || placeBetMutation.isPending}
                    onClick={handlePlaceBet}
                    data-testid="button-place-bet"
                  >
                    {placeBetMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
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

            <div className="lg:hidden">
              <LiveBets roundId={round?.id || null} crypto={upperSymbol} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
