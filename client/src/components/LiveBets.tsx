import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Coins, Activity, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import profileImg from "@/assets/profile.png";

interface LiveBet {
  id: number;
  user_id: string;
  username?: string;
  amount: number;
  direction: string;
  created_at: string;
}

interface LiveBetsProps {
  roundId: number | null;
  crypto: string;
}

export function LiveBets({ roundId, crypto }: LiveBetsProps) {
  const { data: bets = [], isLoading } = useQuery<LiveBet[]>({
    queryKey: ["/api/live-bets", roundId, crypto],
    queryFn: async () => {
      if (!roundId) return [];
      try {
        const data = await api.getLiveBets(roundId, crypto);
        return (data as { bets?: LiveBet[] })?.bets || data as LiveBet[];
      } catch {
        return [];
      }
    },
    enabled: !!roundId,
    staleTime: 30000,
    refetchInterval: 5000,
  });

  const formatWalletAddress = (address?: string) => {
    if (!address) return "Anonymous";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Live Bets
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6 sm:py-8">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Live Bets
          {bets.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {bets.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-1.5 sm:space-y-2 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
          {bets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 sm:py-6 text-xs sm:text-sm">
              No bets placed yet. Be the first!
            </p>
          ) : (
            bets.map((bet, index) => {
              const displayName = bet.username || formatWalletAddress(bet.user_id);
              const isUp = bet.direction.toLowerCase() === "up" || bet.direction.toLowerCase() === "higher";
              
              return (
                <div
                  key={bet.id || index}
                  className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg bg-muted/30 animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                  data-testid={`live-bet-${index}`}
                >
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                    <AvatarImage src={profileImg} alt={displayName} />
                    <AvatarFallback className="text-[10px] sm:text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{displayName}</p>
                  </div>

                  <Badge 
                    variant="outline"
                    className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${isUp ? "border-win text-win" : "border-loss text-loss"}`}
                  >
                    {isUp ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />}
                    {bet.direction.toUpperCase()}
                  </Badge>

                  <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm font-mono shrink-0">
                    <Coins className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-warning" />
                    {bet.amount}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
