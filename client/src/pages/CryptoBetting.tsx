import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { CRYPTO_MAP, type CryptoRound } from "@shared/schema";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins,
  Loader2,
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

interface CryptoCardProps {
  symbol: string;
  name: string;
}

function CryptoCard({ symbol, name }: CryptoCardProps) {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedDirection, setSelectedDirection] = useState<"up" | "down" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: round, isLoading } = useQuery<CryptoRound | null>({
    queryKey: ["/api/rounds", symbol],
    queryFn: async () => {
      try {
        const data = await api.getCurrentRound(symbol);
        if ("waiting" in (data as object)) return null;
        return data as CryptoRound;
      } catch {
        return null;
      }
    },
    refetchInterval: 10000,
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({ roundId, direction, betAmount }: { roundId: number; direction: string; betAmount: number }) => {
      return api.placeBet(roundId, symbol, direction, betAmount);
    },
    onSuccess: () => {
      toast({ title: "Bet placed successfully!" });
      setAmount("");
      setSelectedDirection(null);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", symbol] });
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
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [round]);

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

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!round) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Waiting for next round...</p>
        </CardContent>
      </Card>
    );
  }

  const isExpired = timeLeft <= 0;
  const logo = coinLogos[symbol];

  return (
    <Card className="hover-elevate transition-all" data-testid={`crypto-card-${symbol}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && (
              <img src={logo} alt={symbol} className="h-8 w-8" />
            )}
            <div>
              <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>
          <Badge 
            variant={isExpired ? "destructive" : timeLeft < 10 ? "destructive" : "secondary"}
            className={timeLeft < 10 && !isExpired ? "animate-countdown-pulse" : ""}
          >
            <Clock className="h-3 w-3 mr-1" />
            {isExpired ? "Ended" : formatTime(timeLeft)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">Start Price</p>
          <p className="text-3xl font-bold font-mono tabular-nums">
            ${round.start_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedDirection === "up" ? "default" : "outline"}
            className={`h-14 flex-col gap-1 ${selectedDirection === "up" ? "bg-win hover:bg-win/90 border-win" : ""}`}
            onClick={() => setSelectedDirection("up")}
            disabled={isExpired}
            data-testid={`button-up-${symbol}`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">UP</span>
          </Button>
          <Button
            variant={selectedDirection === "down" ? "default" : "outline"}
            className={`h-14 flex-col gap-1 ${selectedDirection === "down" ? "bg-loss hover:bg-loss/90 border-loss" : ""}`}
            onClick={() => setSelectedDirection("down")}
            disabled={isExpired}
            data-testid={`button-down-${symbol}`}
          >
            <TrendingDown className="h-5 w-5" />
            <span className="text-xs">DOWN</span>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-warning" />
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="font-mono"
              disabled={isExpired}
              data-testid={`input-amount-${symbol}`}
            />
          </div>
          <div className="flex gap-1">
            {[10, 50, 100].map((val) => (
              <Button
                key={val}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setAmount(val.toString())}
                disabled={isExpired}
              >
                {val}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setAmount(user?.credits?.toString() || "0")}
              disabled={isExpired}
            >
              MAX
            </Button>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!selectedDirection || !amount || isExpired || placeBetMutation.isPending}
          onClick={handlePlaceBet}
          data-testid={`button-bet-${symbol}`}
        >
          {placeBetMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Placing Bet...
            </>
          ) : (
            "Place Bet"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CryptoBetting() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Crypto Betting</h1>
          <p className="text-muted-foreground">
            Predict if prices will go up or down in the next round
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(CRYPTO_MAP).map(([symbol, name]) => (
            <CryptoCard key={symbol} symbol={symbol} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
