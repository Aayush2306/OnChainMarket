import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Bet, OnchainBet, CustomBet } from "@shared/schema";
import { 
  TrendingUp, 
  TrendingDown, 
  Coins,
  Trophy,
  Target,
  BarChart3,
  Bitcoin,
  Building2,
  Link2,
  Sparkles
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: typeof Trophy;
  iconColor?: string;
  subtitle?: string;
}

function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", subtitle }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-muted ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-mono tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BetHistoryItemProps {
  bet: Bet | OnchainBet | CustomBet;
  type: "crypto" | "stock" | "onchain" | "custom";
}

function BetHistoryItem({ bet, type }: BetHistoryItemProps) {
  const getIcon = () => {
    switch (type) {
      case "crypto": return Bitcoin;
      case "stock": return Building2;
      case "onchain": return Link2;
      case "custom": return Sparkles;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "crypto": return "text-orange-500";
      case "stock": return "text-emerald-500";
      case "onchain": return "text-violet-500";
      case "custom": return "text-pink-500";
    }
  };

  const Icon = getIcon();
  const iconColor = getIconColor();
  
  const direction = "direction" in bet ? bet.direction : "prediction" in bet ? bet.prediction : "";
  const symbol = "crypto" in bet ? bet.crypto : "token_symbol" in bet ? bet.token_symbol : "category" in bet ? bet.category : "";
  const profit = bet.profit || 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-card-border hover-elevate transition-all">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{symbol}</span>
          <Badge variant="outline" className="text-xs">
            {direction === "up" || direction === "higher" ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {direction?.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Bet: {bet.amount} credits
        </p>
      </div>

      <div className="text-right">
        <Badge
          variant={bet.status === "won" ? "default" : bet.status === "lost" ? "destructive" : "secondary"}
          className={bet.status === "won" ? "bg-win text-white" : ""}
        >
          {bet.status?.toUpperCase()}
        </Badge>
        {profit !== 0 && (
          <p className={`text-sm font-mono mt-1 ${profit > 0 ? "text-win" : "text-loss"}`}>
            {profit > 0 ? "+" : ""}{profit}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Stats() {
  const { user } = useAuth();

  const { data: cryptoBets = [], isLoading: cryptoLoading } = useQuery<Bet[]>({
    queryKey: ["/api/my-stats"],
    queryFn: () => api.getMyStats() as Promise<Bet[]>,
  });

  const { data: onchainBets = [], isLoading: onchainLoading } = useQuery<OnchainBet[]>({
    queryKey: ["/api/onchain/my-bets"],
    queryFn: () => api.getOnchainBets() as Promise<OnchainBet[]>,
  });

  const { data: customBets = [], isLoading: customLoading } = useQuery<CustomBet[]>({
    queryKey: ["/api/custom-bet/user-bets"],
    queryFn: () => api.getUserCustomBets() as Promise<CustomBet[]>,
  });

  const isLoading = cryptoLoading || onchainLoading || customLoading;

  const allBets = [...cryptoBets, ...onchainBets, ...customBets];
  const totalBets = allBets.length;
  const wonBets = allBets.filter(b => b.status === "won").length;
  const lostBets = allBets.filter(b => b.status === "lost").length;
  const winRate = totalBets > 0 ? ((wonBets / totalBets) * 100).toFixed(1) : "0";
  const totalProfit = allBets.reduce((sum, b) => sum + (b.profit || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">My Stats</h1>
          <p className="text-muted-foreground">
            Track your betting performance across all markets
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Credits"
            value={user?.credits?.toLocaleString() || 0}
            icon={Coins}
            iconColor="text-warning"
          />
          <StatsCard
            title="Total Bets"
            value={totalBets}
            icon={Target}
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate}%`}
            icon={Trophy}
            iconColor="text-win"
            subtitle={`${wonBets}W / ${lostBets}L`}
          />
          <StatsCard
            title="Total Profit"
            value={totalProfit >= 0 ? `+${totalProfit}` : totalProfit.toString()}
            icon={BarChart3}
            iconColor={totalProfit >= 0 ? "text-win" : "text-loss"}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bet History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({allBets.length})</TabsTrigger>
                <TabsTrigger value="crypto">Crypto ({cryptoBets.length})</TabsTrigger>
                <TabsTrigger value="onchain">On-Chain ({onchainBets.length})</TabsTrigger>
                <TabsTrigger value="custom">Custom ({customBets.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2">
                {allBets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No bets yet. Start betting to see your history!</p>
                  </div>
                ) : (
                  allBets.slice(0, 20).map((bet, i) => {
                    const type = "crypto" in bet && bet.crypto ? 
                      (["BTC", "ETH", "SOL", "BNB", "MATIC", "XRP", "ADA", "DOGE", "DOT", "AVAX"].includes(bet.crypto) ? "crypto" : "stock") :
                      "category" in bet ? "onchain" : "custom";
                    return <BetHistoryItem key={i} bet={bet} type={type} />;
                  })
                )}
              </TabsContent>

              <TabsContent value="crypto" className="space-y-2">
                {cryptoBets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No crypto bets yet</p>
                  </div>
                ) : (
                  cryptoBets.map((bet, i) => (
                    <BetHistoryItem key={i} bet={bet} type="crypto" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="onchain" className="space-y-2">
                {onchainBets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No on-chain bets yet</p>
                  </div>
                ) : (
                  onchainBets.map((bet, i) => (
                    <BetHistoryItem key={i} bet={bet} type="onchain" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="custom" className="space-y-2">
                {customBets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No custom bets yet</p>
                  </div>
                ) : (
                  customBets.map((bet, i) => (
                    <BetHistoryItem key={i} bet={bet} type="custom" />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
