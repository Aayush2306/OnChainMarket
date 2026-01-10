import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { CRYPTO_MAP, type CryptoRound } from "@shared/schema";
import { 
  Clock, 
  RefreshCw,
  ArrowRight
} from "lucide-react";

import btcLogo from "@/assets/coins/btc.svg";
import ethLogo from "@/assets/coins/eth.svg";
import solLogo from "@/assets/coins/sol.svg";
import bnbLogo from "@/assets/coins/bnb.svg";
import xrpLogo from "@/assets/coins/xrp.svg";
import adaLogo from "@/assets/coins/ada.svg";
import dogeLogo from "@/assets/coins/doge.svg";
import maticLogo from "@/assets/coins/matic.svg";
import dotLogo from "@/assets/coins/dot.svg";
import avaxLogo from "@/assets/coins/avax.svg";

const coinLogos: Record<string, string> = {
  BTC: btcLogo,
  ETH: ethLogo,
  SOL: solLogo,
  BNB: bnbLogo,
  XRP: xrpLogo,
  ADA: adaLogo,
  DOGE: dogeLogo,
  MATIC: maticLogo,
  DOT: dotLogo,
  AVAX: avaxLogo,
};

interface CryptoCardProps {
  symbol: string;
  name: string;
}

function CryptoCard({ symbol, name }: CryptoCardProps) {
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
    refetchInterval: 10000,
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
    const mins = Math.floor(seconds / 60);
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
          <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Waiting for next round...</p>
        </CardContent>
      </Card>
    );
  }

  const isExpired = timeLeft <= 0;
  const logo = coinLogos[symbol];

  return (
    <Link href={`/crypto/${symbol.toLowerCase()}`}>
      <Card className="hover-elevate transition-all cursor-pointer group" data-testid={`crypto-card-${symbol}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logo && (
                <img src={logo} alt={symbol} className="h-10 w-10" />
              )}
              <div>
                <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
                <p className="text-sm text-muted-foreground">{name}</p>
              </div>
            </div>
            <Badge 
              variant={isExpired ? "destructive" : timeLeft < 10 ? "destructive" : "secondary"}
              className={timeLeft < 10 && !isExpired ? "animate-countdown-pulse" : ""}
            >
              <Clock className="h-3 w-3 mr-1" />
              {isExpired ? "Ended" : formatTime(timeLeft)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-3xl font-bold font-mono tabular-nums">
              ${round.start_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <Button className="w-full gap-2 group-hover:gap-3 transition-all" disabled={isExpired}>
            {isExpired ? "Round Ended" : "Trade Now"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CryptoBetting() {
  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display mb-2">Crypto Betting</h1>
          <p className="text-muted-foreground">
            Select a cryptocurrency to view the chart and place your bet
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.entries(CRYPTO_MAP).map(([symbol, name]) => (
            <CryptoCard key={symbol} symbol={symbol} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
