import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { SolanaWalletProvider } from "@/context/WalletContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import CryptoBetting from "@/pages/CryptoBetting";
import CryptoDetail from "@/pages/CryptoDetail";
import StockBetting from "@/pages/StockBetting";
import StockDetail from "@/pages/StockDetail";
import OnchainBetting from "@/pages/OnchainBetting";
import CustomBetting from "@/pages/CustomBetting";
import CustomBetDetail from "@/pages/CustomBetDetail";
import Stats from "@/pages/Stats";
import Leaderboard from "@/pages/Leaderboard";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/crypto">
        {() => <ProtectedRoute component={CryptoBetting} />}
      </Route>
      <Route path="/crypto/:symbol">
        {() => <ProtectedRoute component={CryptoDetail} />}
      </Route>
      <Route path="/stocks">
        {() => <ProtectedRoute component={StockBetting} />}
      </Route>
      <Route path="/stocks/:symbol">
        {() => <ProtectedRoute component={StockDetail} />}
      </Route>
      <Route path="/onchain">
        {() => <ProtectedRoute component={OnchainBetting} />}
      </Route>
      <Route path="/custom">
        {() => <ProtectedRoute component={CustomBetting} />}
      </Route>
      <Route path="/custom/:id">
        {() => <ProtectedRoute component={CustomBetDetail} />}
      </Route>
      <Route path="/stats">
        {() => <ProtectedRoute component={Stats} />}
      </Route>
      <Route path="/leaderboard">
        {() => <ProtectedRoute component={Leaderboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/notifications">
        {() => <ProtectedRoute component={Notifications} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SolanaWalletProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
              <Toaster />
            </SocketProvider>
          </AuthProvider>
        </SolanaWalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
