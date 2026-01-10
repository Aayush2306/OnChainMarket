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
      case "profit": return `${entry.credits?.toLocaleString() || 0}`;
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
          className={`relative p-3 sm:p-4 rounded-xl border-2 ${
            user?.id === entry.user_id ? "border-primary bg-primary/5" : "border-transparent bg-card"
          } animate-slide-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br ${rankColors[index]} text-white font-bold shadow-lg text-sm sm:text-base shrink-0`}>
              {index + 1}
            </div>
            
            <Avatar className="h-9 w-9 sm:h-12 sm:w-12 border-2 border-card-border shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-lg">
                {entry.username?.charAt(0).toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm sm:text-base">{entry.username}</p>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                <span>{entry.total_bets} bets</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-win">{entry.win_rate}% WR</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl font-bold font-mono">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                {getValue(entry)}
              </div>
            </div>
          </div>
        </div>
      ))}

      {entries.slice(3).map((entry, index) => (
        <div
          key={entry.user_id}
          className={`flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg ${
            user?.id === entry.user_id ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
          } hover-elevate transition-all animate-slide-up`}
          style={{ animationDelay: `${(index + 3) * 50}ms` }}
        >
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-muted text-xs sm:text-sm font-medium shrink-0">
            {index + 4}
          </div>

          <Avatar className="h-7 w-7 sm:h-9 sm:w-9 shrink-0">
            <AvatarFallback className="bg-card text-xs sm:text-sm font-medium">
              {entry.username?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-xs sm:text-sm">{entry.username}</p>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs sm:text-sm font-semibold shrink-0">
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
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
    <div className="min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-warning" />
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Top performers across all prediction markets
          </p>
        </div>

        <div className="flex gap-2 mb-4 sm:mb-6">
          <Badge 
            variant={period === "daily" ? "default" : "outline"} 
            className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation"
            onClick={() => setPeriod("daily")}
          >
            24h
          </Badge>
          <Badge 
            variant={period === "weekly" ? "default" : "outline"} 
            className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation"
            onClick={() => setPeriod("weekly")}
          >
            7d
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4 sm:p-6">
                  <div className="h-48 sm:h-64 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-win" />
                  Highest Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <LeaderboardTable 
                  entries={data?.highest_win_rate || []} 
                  type="win_rate"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Most Active
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <LeaderboardTable 
                  entries={data?.most_bets || []} 
                  type="bets"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                  Most Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <LeaderboardTable 
                  entries={data?.most_credits || []} 
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
