import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Coins, TrendingUp, Bitcoin, Link2, Sparkles } from "lucide-react";
import type { Winner } from "@shared/schema";

const typeIcons: Record<string, typeof Bitcoin> = {
  crypto: Bitcoin,
  stock: TrendingUp,
  onchain: Link2,
  custom: Sparkles,
};

const typeColors: Record<string, string> = {
  crypto: "text-orange-500",
  stock: "text-emerald-500",
  onchain: "text-violet-500",
  custom: "text-pink-500",
};

const mockWinners: Winner[] = [
  { username: "CryptoKing", amount: 500, profit: 400, crypto: "BTC", type: "crypto" },
  { username: "DeFiMaster", amount: 200, profit: 160, crypto: "ETH", type: "crypto" },
  { username: "SolanaFan", amount: 1000, profit: 800, token_symbol: "BONK", type: "custom" },
  { username: "StockTrader", amount: 300, profit: 240, crypto: "AAPL", type: "stock" },
  { username: "OnChainDegen", amount: 150, profit: 120, category: "pump.fun", type: "onchain" },
];

export function RecentWinners() {
  const winners = mockWinners;
  const isLoading = false;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Recent Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
                <div className="h-6 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
              const Icon = typeIcons[winner.type] || Bitcoin;
              const iconColor = typeColors[winner.type] || "text-primary";
              
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card hover-elevate transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`winner-${index}`}
                >
                  <Avatar className="h-10 w-10 border-2 border-win/20">
                    <AvatarFallback className="bg-win/10 text-win font-semibold">
                      {winner.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{winner.username}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className={`h-3 w-3 ${iconColor}`} />
                      <span className="truncate">
                        {winner.crypto || winner.token_symbol || winner.category}
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
