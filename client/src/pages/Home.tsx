import { BettingCard } from "@/components/BettingCard";
import { RecentWinners } from "@/components/RecentWinners";
import { useAuth } from "@/context/AuthContext";
import { Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <section className="relative py-10 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6 animate-fade-in">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Predict. Bet. Win.
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-slide-up">
              The Future of{" "}
              <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent">
                Prediction Markets
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 px-4 sm:px-0 animate-slide-up" style={{ animationDelay: "100ms" }}>
              Bet on crypto prices, stocks, on-chain metrics, and create custom prediction markets. 
              Connect your Phantom wallet and start winning today.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
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

          <div className="max-w-2xl mx-auto px-0 sm:px-4">
            <RecentWinners />
          </div>
        </div>
      </section>
    </div>
  );
}
