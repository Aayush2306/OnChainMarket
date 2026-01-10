import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Coins, 
  BarChart3, 
  Trophy, 
  Wallet, 
  LogOut, 
  User,
  Menu,
  X,
  Bell
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import mainLogo from "@/assets/main-logo.png";
import profileImg from "@/assets/profile.png";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover-elevate rounded-lg px-2 py-1">
            <img src={mainLogo} alt="On-Chain Market" className="h-8 w-8 rounded-lg" />
            <span className="font-display text-xl font-bold tracking-tight" data-testid="logo-text">
              On-Chain Market
            </span>
          </Link>

          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 border border-card-border" data-testid="credits-display">
                  <Coins className="h-4 w-4 text-warning" />
                  <span className="font-mono text-sm font-semibold tabular-nums">
                    {user?.credits?.toLocaleString() || 0}
                  </span>
                </div>

                <Link href="/stats">
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-stats">
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/leaderboard">
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-leaderboard">
                    <Trophy className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-notifications">
                    <Bell className="h-5 w-5" />
                  </Button>
                </Link>

                <Button variant="secondary" size="sm" className="gap-2" data-testid="button-deposit">
                  <Wallet className="h-4 w-4" />
                  Deposit
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile-menu">
                      <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarImage src={profileImg} alt={user?.username || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer" data-testid="link-profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/stats" className="cursor-pointer" data-testid="link-my-stats">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        My Stats
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-destructive focus:text-destructive cursor-pointer"
                      data-testid="button-logout"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="gap-2" data-testid="button-login">
                <Wallet className="h-4 w-4" />
                Login with Phantom
              </Button>
            </Link>
          )}
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <div className="border-t border-border py-4 md:hidden animate-slide-up">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-card">
                <span className="text-sm text-muted-foreground">Credits</span>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-warning" />
                  <span className="font-mono font-semibold">{user?.credits?.toLocaleString() || 0}</span>
                </div>
              </div>
              
              <Link href="/stats" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  My Stats
                </Button>
              </Link>
              
              <Link href="/leaderboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Button>
              </Link>
              
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Button>
              </Link>

              <Link href="/notifications" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
              </Link>
              
              <Button variant="secondary" className="w-full justify-start gap-2">
                <Wallet className="h-4 w-4" />
                Deposit
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
