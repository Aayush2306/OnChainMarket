import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, Bitcoin, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import profileImg from "@/assets/profile.png";

interface RecentWin {
  id: number;
  user_id: string;
  username?: string;
  amount: number;
  profit: number;
  crypto: string;
  direction: string;
  status: string;
  start_price: number;
  end_price: number;
  round_id: number;
  created_at: string;
}

export function RecentWinners() {
  const { data: winners = [], isLoading } = useQuery<RecentWin[]>({
    queryKey: ["/api/recent-wins"],
    queryFn: async () => {
      try {
        const data = await api.getRecentWinners();
        return data as RecentWin[];
      } catch {
        return [];
      }
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Recent Winners
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Recent Winners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {winners.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recent winners yet. Be the first!
            </p>
          ) : (
            winners.map((winner, index) => {
              const displayName = winner.username || formatWalletAddress(winner.user_id);
              
              return (
                <div
                  key={winner.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover-elevate transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`winner-${index}`}
                >
                  <Avatar className="h-10 w-10 border-2 border-win/20">
                    <AvatarImage src={profileImg} alt={displayName} />
                    <AvatarFallback className="bg-win/10 text-win font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{displayName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Bitcoin className="h-3 w-3 text-orange-500" />
                      <span className="truncate">
                        {winner.crypto} - {winner.direction.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <Badge className="bg-win/10 text-win border-win/20 font-mono">
                    <Coins className="h-3 w-3 mr-1" />
                    +{winner.profit.toLocaleString()}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
