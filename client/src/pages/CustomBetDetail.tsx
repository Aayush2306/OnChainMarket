import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { type CustomBetRound } from "@shared/schema";
import { DexScreenerChart } from "@/components/DexScreenerChart";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Coins,
  Loader2,
  ArrowLeft,
  Sparkles,
  Users
} from "lucide-react";

export default function CustomBetDetail() {
  const { id } = useParams<{ id: string }>();
  const roundId = parseInt(id || "0");
  
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const { isConnected, joinCustomBetRoom, leaveCustomBetRoom } = useSocket();
  const [amount, setAmount] = useState("");
  const [selectedPrediction, setSelectedPrediction] = useState<"higher" | "lower" | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Join socket room for real-time updates
  useEffect(() => {
    if (roundId && isConnected) {
      joinCustomBetRoom(roundId);
      return () => leaveCustomBetRoom(roundId);
    }
  }, [roundId, isConnected, joinCustomBetRoom, leaveCustomBetRoom]);

  const { data: bet, isLoading } = useQuery<CustomBetRound | null>({
    queryKey: ["/api/custom-bet", roundId],
    queryFn: async () => {
      try {
        const data = await api.getCustomBetDetails(roundId);
        return data as CustomBetRound;
      } catch {
        return null;
      }
    },
    enabled: !!roundId,
    // Use longer polling interval when socket is connected (socket handles real-time updates)
    refetchInterval: isConnected ? 30000 : 5000,
  });

  const placeBetMutation = useMutation({
    mutationFn: ({ prediction, betAmount }: { prediction: string; betAmount: number }) =>
      api.placeCustomBet(roundId, prediction, betAmount),
    onSuccess: () => {
      toast({ title: "Bet placed successfully!" });
      setAmount("");
      setSelectedPrediction(null);
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet", roundId] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to place bet";
      toast({ title: message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (!bet) return;

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = bet.end_time - now;
      setTimeLeft(Math.max(0, remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [bet]);

  const handlePlaceBet = () => {
    if (!selectedPrediction || !amount) return;

    const betAmount = parseInt(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    if (user && betAmount > user.credits) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    placeBetMutation.mutate({ prediction: selectedPrediction, betAmount });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="min-h-screen py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/custom">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Custom Bets
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium mb-2">Bet Not Found</p>
              <p className="text-muted-foreground">This custom bet doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;
  const bettingClosed = timeLeft < 300;

  return (
    <div className="min-h-screen py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/custom">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            Back to Custom Bets
          </Button>
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display">{bet.token_symbol || "Token"}</h1>
            <p className="text-muted-foreground">{bet.token_name}</p>
          </div>
          <Badge 
            variant={isExpired ? "destructive" : bettingClosed ? "secondary" : "default"}
            className={`ml-auto text-lg px-4 py-2 ${timeLeft < 60 && !isExpired ? "animate-countdown-pulse" : ""}`}
          >
            <Clock className="h-4 w-4 mr-2" />
            {isExpired ? "Ended" : formatTime(timeLeft)}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <DexScreenerChart tokenAddress={bet.token_ca} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bet Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Start Price</p>
                    <p className="font-mono font-semibold">${bet.start_price.toFixed(6)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Pool</p>
                    <p className="font-mono font-semibold">{bet.total_pool.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-mono font-semibold">{bet.duration_minutes}m</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Creator</p>
                    <p className="font-medium truncate">@{bet.creator_username}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card data-testid="betting-panel">
              <CardHeader>
                <CardTitle>Place Your Bet</CardTitle>
                <CardDescription>
                  Predict if the price will be higher or lower when the round ends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Start Price</p>
                  <p className="text-4xl font-bold font-mono tabular-nums">
                    ${bet.start_price.toFixed(6)}
                  </p>
                </div>

                {!isExpired && !bettingClosed ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={selectedPrediction === "higher" ? "default" : "outline"}
                        className={`h-16 flex-col gap-2 ${selectedPrediction === "higher" ? "bg-win hover:bg-win/90 border-win" : ""}`}
                        onClick={() => setSelectedPrediction("higher")}
                        data-testid="button-higher"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span>HIGHER</span>
                      </Button>
                      <Button
                        variant={selectedPrediction === "lower" ? "default" : "outline"}
                        className={`h-16 flex-col gap-2 ${selectedPrediction === "lower" ? "bg-loss hover:bg-loss/90 border-loss" : ""}`}
                        onClick={() => setSelectedPrediction("lower")}
                        data-testid="button-lower"
                      >
                        <TrendingDown className="h-6 w-6" />
                        <span>LOWER</span>
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
                      >
                        MAX ({user?.credits?.toLocaleString() || 0})
                      </Button>
                    </div>

                    <Button
                      className="w-full h-12 text-lg"
                      disabled={!selectedPrediction || !amount || placeBetMutation.isPending}
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
                  </>
                ) : bettingClosed && !isExpired ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Betting Closed</p>
                    <p className="text-sm">Waiting for result...</p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-medium">Round Ended</p>
                    <p className="text-sm">Check notifications for results</p>
                  </div>
                )}
              </CardContent>
            </Card>

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
