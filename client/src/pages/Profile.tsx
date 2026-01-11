import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { 
  Coins, 
  Trophy,
  Target,
  Calendar,
  Wallet,
  Copy,
  Check,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import profileImg from "@/assets/profile.png";
import type { Bet, OnchainBet, CustomBet } from "@shared/schema";

interface BetWithTimestamp {
  status?: string;
  profit?: number;
  created_at?: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: creatorEarnings = { total_earnings: 0, total_rounds_created: 0 } } = useQuery<{ total_earnings: number; total_rounds_created: number }>({
    queryKey: ["/api/custom-bet/creator-earnings"],
    queryFn: () => api.getCreatorEarnings() as Promise<{ total_earnings: number; total_rounds_created: number }>,
  });

  const { data: cryptoBets = [] } = useQuery<Bet[]>({
    queryKey: ["/api/my-stats"],
    queryFn: () => api.getMyStats() as Promise<Bet[]>,
  });

  const { data: onchainBets = [] } = useQuery<OnchainBet[]>({
    queryKey: ["/api/onchain/my-bets"],
    queryFn: () => api.getOnchainBets() as Promise<OnchainBet[]>,
  });

  const { data: customBets = [] } = useQuery<CustomBet[]>({
    queryKey: ["/api/custom-bet/user-bets"],
    queryFn: () => api.getUserCustomBets() as Promise<CustomBet[]>,
  });

  const allBets: BetWithTimestamp[] = useMemo(() => {
    return [...cryptoBets, ...onchainBets, ...customBets];
  }, [cryptoBets, onchainBets, customBets]);

  const stats = useMemo(() => {
    const completedBets = allBets.filter(b => b.status === "won" || b.status === "lost");
    const wins = completedBets.filter(b => b.status === "won").length;
    const totalProfit = allBets.reduce((sum, b) => sum + (b.profit || 0), 0);
    const winRate = completedBets.length > 0 ? Math.round((wins / completedBets.length) * 100) : 0;
    return { wins, winRate, totalProfit, totalBets: completedBets.length };
  }, [allBets]);

  const chartData = useMemo(() => {
    const sorted = [...allBets]
      .filter(b => b.status === "won" || b.status === "lost")
      .filter(b => b.created_at)
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
    
    let cumulative = 0;
    return sorted.map((bet, i) => {
      cumulative += bet.profit || 0;
      return {
        index: i + 1,
        profit: cumulative,
        date: new Date(bet.created_at || 0).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
    });
  }, [allBets]);

  const handleCopyAddress = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-chart-2/20 to-chart-3/20" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                <AvatarImage src={profileImg} alt={user?.username || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-display">{user?.name || "User"}</h1>
                <p className="text-muted-foreground">@{user?.username}</p>
              </div>

              <Button variant="secondary" className="gap-2" data-testid="button-deposit-profile">
                <Wallet className="h-4 w-4" />
                Deposit Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm">Wallet Address</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm truncate max-w-[120px]">
                    {user?.id?.slice(0, 6)}...{user?.id?.slice(-4)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={handleCopyAddress}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-win" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <span className="text-sm font-medium">{formatDate(user?.joined_at || null)}</span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm">Current Balance</span>
                </div>
                <Badge className="font-mono text-base px-3 py-1">
                  {user?.credits?.toLocaleString() || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-500" />
                Creator Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold font-mono text-pink-500">
                    {creatorEarnings.total_rounds_created}
                  </p>
                  <p className="text-sm text-muted-foreground">Bets Created</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold font-mono text-win">
                    +{creatorEarnings.total_earnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Earn credits when users bet on your custom prediction markets
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold font-mono">{stats.wins}</p>
                <p className="text-xs text-muted-foreground">Total Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold font-mono">{stats.winRate}%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Coins className="h-6 w-6 mx-auto mb-2 text-win" />
                <p className={`text-2xl font-bold font-mono ${stats.totalProfit >= 0 ? "text-win" : "text-loss"}`}>
                  {stats.totalProfit >= 0 ? "+" : ""}{stats.totalProfit.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-chart-2" />
                <p className="text-2xl font-bold font-mono">{stats.totalBets}</p>
                <p className="text-xs text-muted-foreground">Total Bets</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Visit <Link href="/stats" className="text-primary hover:underline">My Stats</Link> for detailed analytics
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 1 ? (
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [
                        <span className={value >= 0 ? "text-win" : "text-loss"}>
                          {value >= 0 ? "+" : ""}{value.toLocaleString()} credits
                        </span>,
                        "Cumulative Profit"
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete more bets to see your performance chart</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
