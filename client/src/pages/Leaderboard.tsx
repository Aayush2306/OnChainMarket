import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { LeaderboardData, LeaderboardEntry } from "@shared/schema";
import { 
  Trophy, 
  Target,
  TrendingUp,
  Coins
} from "lucide-react";

const rankColors = [
  "from-yellow-400 to-amber-500",
  "from-gray-300 to-gray-400", 
  "from-orange-400 to-amber-600",
];

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: "win_rate" | "bets" | "profit";
}

function LeaderboardTable({ entries, type }: LeaderboardTableProps) {
  const { user } = useAuth();

  const getValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case "win_rate": return `${entry.win_rate}%`;
      case "bets": return entry.total_bets.toString();
      case "profit": return entry.profit >= 0 ? `+${entry.profit.toLocaleString()}` : entry.profit.toLocaleString();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "win_rate": return Target;
      case "bets": return TrendingUp;
      case "profit": return Coins;
    }
  };

  const Icon = getIcon();

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No entries yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.slice(0, 3).map((entry, index) => (
        <div
          key={entry.user_id}
          className={`relative p-4 rounded-xl border-2 ${
            user?.id === entry.user_id ? "border-primary bg-primary/5" : "border-transparent bg-card"
          } animate-slide-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${rankColors[index]} text-white font-bold shadow-lg`}>
              {index + 1}
            </div>
            
            <Avatar className="h-12 w-12 border-2 border-card-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {entry.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{entry.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{entry.total_bets} bets</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-win">{entry.win_rate}% WR</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 text-xl font-bold font-mono">
                <Icon className="h-5 w-5 text-primary" />
                {getValue(entry)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {entries.slice(3).map((entry, index) => (
        <div
          key={entry.user_id}
          className={`flex items-center gap-4 p-3 rounded-lg ${
            user?.id === entry.user_id ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
          } hover-elevate transition-all animate-slide-up`}
          style={{ animationDelay: `${(index + 3) * 50}ms` }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {index + 4}
          </div>

          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-card text-sm font-medium">
              {entry.username?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{entry.username}</p>
          </div>

          <div className="flex items-center gap-1 font-mono text-sm font-semibold">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {getValue(entry)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [period, setPeriod] = useState("daily");

  const { data, isLoading } = useQuery<LeaderboardData>({
    queryKey: ["/api/leaderboard", period],
    queryFn: () => api.getLeaderboard(period) as Promise<LeaderboardData>,
  });

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-warning" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top performers across all prediction markets
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge 
            variant={period === "daily" ? "default" : "outline"} 
            className="cursor-pointer px-4 py-2"
            onClick={() => setPeriod("daily")}
          >
            24h
          </Badge>
          <Badge 
            variant={period === "weekly" ? "default" : "outline"} 
            className="cursor-pointer px-4 py-2"
            onClick={() => setPeriod("weekly")}
          >
            7d
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-64 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-win" />
                  Highest Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable 
                  entries={data?.highest_win_rate || []} 
                  type="win_rate"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Most Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable 
                  entries={data?.most_bets || []} 
                  type="bets"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-warning" />
                  Most Profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardTable 
                  entries={data?.most_profit || []} 
                  type="profit"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
