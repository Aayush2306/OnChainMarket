import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bitcoin, 
  TrendingUp, 
  Link2, 
  Sparkles,
  ArrowRight,
  type LucideIcon
} from "lucide-react";

interface BettingCardProps {
  title: string;
  description: string;
  icon: "crypto" | "stock" | "onchain" | "custom";
  href: string;
  activeRounds?: number;
  gradient: string;
}

const iconMap: Record<string, LucideIcon> = {
  crypto: Bitcoin,
  stock: TrendingUp,
  onchain: Link2,
  custom: Sparkles,
};

const gradientMap: Record<string, string> = {
  crypto: "from-orange-500 to-amber-500",
  stock: "from-emerald-500 to-teal-500",
  onchain: "from-violet-500 to-purple-500",
  custom: "from-pink-500 to-rose-500",
};

export function BettingCard({
  title,
  description,
  icon,
  href,
  activeRounds,
}: BettingCardProps) {
  const Icon = iconMap[icon];
  const gradient = gradientMap[icon];

  return (
    <Link href={href}>
      <Card
        className="group relative overflow-visible p-4 sm:p-6 hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 h-full min-h-[160px] sm:min-h-[200px] flex flex-col touch-manipulation"
        data-testid={`card-${icon}-betting`}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" 
          style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
        />
        
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg shrink-0`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          
          {typeof activeRounds === "number" && (
            <Badge variant="secondary" className="font-mono text-[10px] sm:text-xs px-1.5 sm:px-2">
              {activeRounds} active
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-2 sm:mt-4 text-xs sm:text-sm font-medium text-primary sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          Start Betting
          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Card>
    </Link>
  );
}
