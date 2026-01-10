import { useState } from "react";
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
  Sparkles
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: creatorEarnings = { total_earnings: 0, total_rounds_created: 0 } } = useQuery<{ total_earnings: number; total_rounds_created: number }>({
    queryKey: ["/api/custom-bet/creator-earnings"],
    queryFn: () => api.getCreatorEarnings() as Promise<{ total_earnings: number; total_rounds_created: number }>,
  });

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
                <AvatarImage src="/profile-avatar.png" alt={user?.username || "User"} />
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
                <p className="text-2xl font-bold font-mono">--</p>
                <p className="text-xs text-muted-foreground">Total Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold font-mono">--</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Coins className="h-6 w-6 mx-auto mb-2 text-win" />
                <p className="text-2xl font-bold font-mono">--</p>
                <p className="text-xs text-muted-foreground">Total Profit</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-chart-2" />
                <p className="text-2xl font-bold font-mono">--</p>
                <p className="text-xs text-muted-foreground">Leaderboard</p>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Visit <Link href="/stats" className="text-primary hover:underline">My Stats</Link> for detailed analytics
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
