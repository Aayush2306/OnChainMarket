import { BettingCard } from "@/components/BettingCard";
import { RecentWinners } from "@/components/RecentWinners";
import { useAuth } from "@/context/AuthContext";
import { Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6 animate-fade-in">
              <Zap className="h-4 w-4" />
              Predict. Bet. Win.
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 animate-slide-up">
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Prediction Markets
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Bet on crypto prices, stocks, on-chain metrics, and create custom prediction markets. 
              Connect your Phantom wallet and start winning today.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            <BettingCard
              title="Crypto Betting"
              description="Predict price movements for BTC, ETH, SOL, and 7 more cryptocurrencies"
              icon="crypto"
              href={isAuthenticated ? "/crypto" : "/login"}
              gradient="from-orange-500 to-amber-500"
              activeRounds={10}
            />
            
            <BettingCard
              title="Stock Betting"
              description="Bet on daily movements of AAPL, GOOGL, TSLA, NVDA, and more"
              icon="stock"
              href={isAuthenticated ? "/stocks" : "/login"}
              gradient="from-emerald-500 to-teal-500"
              activeRounds={8}
            />
            
            <BettingCard
              title="On-Chain Predictions"
              description="Predict pump.fun launches, graduations, and other on-chain metrics"
              icon="onchain"
              href={isAuthenticated ? "/onchain" : "/login"}
              gradient="from-violet-500 to-purple-500"
              activeRounds={2}
            />
            
            <BettingCard
              title="Custom Bets"
              description="Create your own prediction markets on any Solana token"
              icon="custom"
              href={isAuthenticated ? "/custom" : "/login"}
              gradient="from-pink-500 to-rose-500"
            />
          </div>

          <div className="max-w-2xl mx-auto">
            <RecentWinners />
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
              <div className="text-4xl font-bold font-display text-primary mb-2">1.8x</div>
              <p className="text-muted-foreground">Payout on Wins</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="text-4xl font-bold font-display text-primary mb-2">60s</div>
              <p className="text-muted-foreground">Round Duration</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="text-4xl font-bold font-display text-primary mb-2">10+</div>
              <p className="text-muted-foreground">Supported Assets</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
