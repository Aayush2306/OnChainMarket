import { z } from "zod";

// User Types
export interface User {
  id: string;
  name: string | null;
  username: string | null;
  joined_at: string | null;
  credits: number;
}

export const insertUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore, and hyphen"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

// Crypto Round Types
export interface CryptoRound {
  id: number;
  crypto: string;
  start_price: number;
  end_price: number | null;
  start_time: number;
  end_time: number;
  result: "up" | "down" | "same" | null;
}

// Bet Types
export interface Bet {
  id: number;
  user_id: string;
  round_id: number;
  crypto: string;
  direction: "up" | "down";
  amount: number;
  status: "pending" | "won" | "lost" | "refunded";
  profit?: number;
  created_at?: string;
  start_price?: number;
  end_price?: number;
  result?: string;
}

export const placeBetSchema = z.object({
  round_id: z.number(),
  crypto: z.string(),
  direction: z.enum(["up", "down"]),
  amount: z.number().min(1).max(100000),
});

export type PlaceBet = z.infer<typeof placeBetSchema>;

// On-chain Round Types
export interface OnchainRound {
  id: number;
  category: string;
  start_value: number;
  end_value: number | null;
  reference_value: number;
  start_time: number;
  end_time: number;
  result: "higher" | "lower" | null;
  metadata?: Record<string, unknown>;
}

export interface OnchainBet {
  id: number;
  user_id: string;
  round_id: number;
  category: string;
  prediction: "higher" | "lower";
  amount: number;
  status: "pending" | "won" | "lost";
  profit: number;
  created_at: string;
}

// Custom Bet Types
export interface CustomBetRound {
  id: number;
  creator_id: string;
  token_ca: string;
  token_name: string | null;
  token_symbol: string | null;
  start_price: number;
  end_price: number | null;
  start_mcap: number;
  duration_minutes: number;
  start_time: number;
  end_time: number;
  result: "higher" | "lower" | null;
  total_pool: number;
  creator_earnings: number;
  status: "active" | "resolved";
  created_at: string;
  bet_count?: number;
  higher_pool?: number;
  lower_pool?: number;
  creator_username?: string;
}

export interface CustomBet {
  id: number;
  user_id: string;
  round_id: number;
  prediction: "higher" | "lower";
  amount: number;
  status: "pending" | "won" | "lost";
  profit: number;
  created_at: string;
  token_name?: string;
  token_symbol?: string;
  token_ca?: string;
  start_price?: number;
  end_price?: number;
  duration_minutes?: number;
  result?: string;
}

export const createCustomBetSchema = z.object({
  token_ca: z.string().min(32).max(44),
  duration: z.number().refine((val) => [15, 30, 60].includes(val), "Duration must be 15, 30, or 60 minutes"),
});

export type CreateCustomBet = z.infer<typeof createCustomBetSchema>;

export const placeCustomBetSchema = z.object({
  round_id: z.number(),
  prediction: z.enum(["higher", "lower"]),
  amount: z.number().min(1).max(100000),
});

export type PlaceCustomBet = z.infer<typeof placeCustomBetSchema>;

// Leaderboard Types
export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_bets: number;
  profit: number;
  loss: number;
  win_rate: number;
  credits: number;
}

export interface LeaderboardData {
  highest_win_rate: LeaderboardEntry[];
  most_bets: LeaderboardEntry[];
  most_credits: LeaderboardEntry[];
  biggest_losers?: LeaderboardEntry[];
}

// Winner Types
export interface Winner {
  username: string;
  amount: number;
  profit: number;
  crypto?: string;
  token_symbol?: string;
  category?: string;
  type: "crypto" | "stock" | "onchain" | "custom";
}

// Stock Map
export const STOCK_MAP: Record<string, string> = {
  AAPL: "Apple Inc.",
  GOOGL: "Google Inc.",
  AMZN: "Amazon.com Inc.",
  MSFT: "Microsoft Corp.",
  TSLA: "Tesla Inc.",
  META: "Meta Platforms Inc.",
  NVDA: "NVIDIA Corp.",
  NFLX: "Netflix Inc.",
};

// Crypto Map
export const CRYPTO_MAP: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB",
  MATIC: "Polygon",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  DOT: "Polkadot",
  AVAX: "Avalanche",
};

// On-chain Categories
export const ONCHAIN_CATEGORIES = {
  pumpfun_launches: {
    name: "pump.fun Token Launches",
    description: "Total tokens launched on pump.fun in 24 hours",
    icon: "Rocket",
  },
  pumpfun_graduations: {
    name: "pump.fun Graduations",
    description: "Tokens that graduated on pump.fun in 24 hours",
    icon: "GraduationCap",
  },
};
