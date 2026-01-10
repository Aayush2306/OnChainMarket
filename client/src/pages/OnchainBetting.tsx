import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { ONCHAIN_CATEGORIES, type OnchainRound } from "@shared/schema";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins,
  Loader2
} from "lucide-react";

import pumpLogo from "@/assets/pump.png";

interface OnchainCardProps {
  category: string;
  config: {
    name: string;
    description: string;
    icon: string;
  };
}

function OnchainCard({ category, config }: OnchainCardProps) {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState<"higher" | "lower" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: round, isLoading } = useQuery<OnchainRound | null>({
    queryKey: ["/api/onchain/round", category],
    queryFn: async () => {
      try {
        const data = await api.getOnchainRound(category);
        if ("waiting" in (data as object)) return null;
        return data as OnchainRound;
      } catch {
        return null;
      }
    },
    refetchInterval: 60000,
  });

  const placeBetMutation = useMutation({
    mutationFn: async ({ roundId, prediction, betAmount }: { roundId: number; prediction: string; betAmount: number }) => {
      return api.placeOnchainBet(roundId, category, prediction, betAmount);
    },
    onSuccess: () => {
      toast({ title: "Bet placed successfully!" });
      setAmount("");
      setSelectedPrediction(null);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/onchain/round", category] });
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

  const handlePlaceBet = () => {
    if (!round || !selectedPrediction || !amount) return;

    const betAmount = parseInt(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (user && betAmount > user.credits) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    placeBetMutation.mutate({ roundId: round.id, prediction: selectedPrediction, betAmount });
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

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!round) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <img src={pumpLogo} alt="pump.fun" className="h-10 w-10 rounded-lg" />
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground py-8">
          <p>No active round. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  const isExpired = timeLeft <= 0;

  return (
    <Card className="hover-elevate transition-all" data-testid={`onchain-card-${category}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={pumpLogo} alt="pump.fun" className="h-10 w-10 rounded-lg" />
            <div>
              <CardTitle className="text-lg">{config.name}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={isExpired ? "destructive" : "secondary"}
          >
            <Clock className="h-3 w-3 mr-1" />
            {isExpired ? "Ended" : formatTime(timeLeft)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Reference Value</p>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {round.reference_value.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="text-2xl font-bold font-mono tabular-nums">
              {round.start_value.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedPrediction === "higher" ? "default" : "outline"}
            className={`h-14 flex-col gap-1 ${selectedPrediction === "higher" ? "bg-win hover:bg-win/90 border-win" : ""}`}
            onClick={() => setSelectedPrediction("higher")}
            disabled={isExpired}
            data-testid={`button-higher-${category}`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">HIGHER</span>
          </Button>
          <Button
            variant={selectedPrediction === "lower" ? "default" : "outline"}
            className={`h-14 flex-col gap-1 ${selectedPrediction === "lower" ? "bg-loss hover:bg-loss/90 border-loss" : ""}`}
            onClick={() => setSelectedPrediction("lower")}
            disabled={isExpired}
            data-testid={`button-lower-${category}`}
          >
            <TrendingDown className="h-5 w-5" />
            <span className="text-xs">LOWER</span>
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
              data-testid={`input-amount-${category}`}
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
          disabled={!selectedPrediction || !amount || isExpired || placeBetMutation.isPending}
          onClick={handlePlaceBet}
          data-testid={`button-bet-${category}`}
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

export default function OnchainBetting() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">On-Chain Predictions</h1>
          <p className="text-muted-foreground">
            Predict on-chain metrics from pump.fun and other protocols
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(ONCHAIN_CATEGORIES).map(([category, config]) => (
            <OnchainCard key={category} category={category} config={config} />
          ))}
        </div>
      </div>
    </div>
  );
}
