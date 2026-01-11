import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@shared/schema";
import { api } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  setNeedsOnboarding: (value: boolean) => void;
  login: (walletAddress: string, signature: string, name?: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await api.getProfile() as User;
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await api.getProfile() as User;
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (walletAddress: string, signature: string, name?: string, username?: string) => {
    const userData = await api.verifySignature(walletAddress, signature, name, username) as User;
    setUser(userData);
    setNeedsOnboarding(false);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
    setWalletAddress(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        needsOnboarding,
        setNeedsOnboarding,
        login,
        logout,
        refreshUser,
        walletAddress,
        setWalletAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
