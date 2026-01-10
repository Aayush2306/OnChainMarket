import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { STOCK_MAP, type CryptoRound } from "@shared/schema";
import { 
  Clock, 
  Building2,
  ArrowRight
} from "lucide-react";

import appleLogo from "@/assets/coins/apple.svg";
import googleLogo from "@/assets/coins/google.svg";
import teslaLogo from "@/assets/coins/tesla.svg";
import microsoftLogo from "@/assets/coins/microsoft.svg";
import amazonLogo from "@/assets/coins/amazon.svg";
import metaLogo from "@/assets/coins/meta.svg";
import netflixLogo from "@/assets/coins/netflix.svg";
import nvidiaLogo from "@/assets/coins/nvidia.svg";

const stockLogos: Record<string, string> = {
  AAPL: appleLogo,
  GOOGL: googleLogo,
  TSLA: teslaLogo,
  MSFT: microsoftLogo,
  AMZN: amazonLogo,
  META: metaLogo,
  NFLX: netflixLogo,
  NVDA: nvidiaLogo,
};

interface StockCardProps {
  symbol: string;
  name: string;
}

function StockCard({ symbol, name }: StockCardProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  const { data: round, isLoading } = useQuery<CryptoRound | null>({
    queryKey: ["/api/rounds", symbol],
    queryFn: async () => {
      try {
        const data = await api.getCurrentRound(symbol);
        if ("waiting" in (data as object)) return null;
        return data as CryptoRound;
      } catch {
        return null;
      }
    },
    refetchInterval: 30000,
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
          <div className="h-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!round) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Market Closed</p>
          <p className="text-sm">Opens Mon-Fri 9:30 AM EST</p>
        </CardContent>
      </Card>
    );
  }

  const isExpired = timeLeft <= 0;
  const logo = stockLogos[symbol];

  return (
    <Link href={`/stocks/${symbol.toLowerCase()}`}>
      <Card className="hover-elevate transition-all cursor-pointer group" data-testid={`stock-card-${symbol}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt={symbol} className="h-10 w-10" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
                <p className="text-sm text-muted-foreground truncate max-w-[140px]">{name}</p>
              </div>
            </div>
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              <Clock className="h-3 w-3 mr-1" />
              {isExpired ? "Ended" : formatTime(timeLeft)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Opening Price</p>
            <p className="text-3xl font-bold font-mono tabular-nums">
              ${round.start_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <Button className="w-full gap-2 group-hover:gap-3 transition-all" disabled={isExpired}>
            {isExpired ? "Market Closed" : "Trade Now"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function StockBetting() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Stock Betting</h1>
          <p className="text-muted-foreground">
            Select a stock to view the chart and place your bet
          </p>
          <Badge variant="secondary" className="mt-2">
            Market Hours: Mon-Fri 9:30 AM - 4:00 PM EST
          </Badge>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(STOCK_MAP).map(([symbol, name]) => (
            <StockCard key={symbol} symbol={symbol} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
