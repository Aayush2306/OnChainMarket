import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Bitcoin
} from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
  id: number;
  crypto?: string;
  symbol?: string;
  direction: string;
  amount: number;
  profit?: number;
  payout?: number;
  status: string;
  result?: string;
  start_price?: number;
  end_price?: number;
  created_at: string;
  resolved_at?: string;
}

export default function Notifications() {
  const { data, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: () => api.getNotifications() as Promise<Notification[]>,
    staleTime: 30000,
    refetchInterval: 30000,
  });

  const notifications = data || [];
  const completedBets = notifications.filter((n: Notification) => 
    n.status === "won" || n.status === "lost" || n.result === "won" || n.result === "lost" || n.profit !== undefined
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-4 sm:py-8">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display">Notifications</h1>
          </div>
          <div className="flex items-center justify-center py-8 sm:py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold font-display">Notifications</h1>
          </div>
          {completedBets.length > 0 && (
            <Badge variant="secondary" className="text-xs sm:text-sm">{completedBets.length} results</Badge>
          )}
        </div>

        {completedBets.length === 0 ? (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
              <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Notifications Yet</p>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your bet results will appear here once they're settled
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {completedBets.map((n, index) => {
              const isWin = n.status === "won" || n.result === "won";
              const isUp = n.direction?.toLowerCase() === "up" || n.direction?.toLowerCase() === "higher";
              const symbol = n.crypto || n.symbol || "BET";
              const winAmount = n.profit || n.payout || n.amount;
              
              return (
                <Card 
                  key={n.id} 
                  className={`hover-elevate transition-all ${isWin ? "border-win/30" : "border-loss/30"}`}
                  data-testid={`notification-${index}`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full shrink-0 ${isWin ? "bg-win/10" : "bg-loss/10"}`}>
                        {isWin ? (
                          <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-win" />
                        ) : (
                          <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-loss" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className={`font-semibold text-sm sm:text-base ${isWin ? "text-win" : "text-loss"}`}>
                            {isWin ? "You Won!" : "You Lost"}
                          </span>
                          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                            <Bitcoin className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                            {symbol}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                          {n.direction && (
                            <>
                              <span className="flex items-center gap-0.5 sm:gap-1">
                                {isUp ? <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                                {n.direction.toUpperCase()}
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className="truncate">{formatDate(n.resolved_at || n.created_at)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-mono font-bold text-base sm:text-lg ${isWin ? "text-win" : "text-loss"}`}>
                          {isWin ? "+" : "-"}{isWin ? winAmount : n.amount}
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-muted-foreground justify-end">
                          <Coins className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Bet: {n.amount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {completedBets.length > 0 && (
          <Card className="mt-6 sm:mt-8">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-base sm:text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono">{completedBets.length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Total Results</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-win">
                    {completedBets.filter(n => n.status === "won" || n.result === "won").length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Wins</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-loss">
                    {completedBets.filter(n => n.status === "lost" || n.result === "lost").length}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Losses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
