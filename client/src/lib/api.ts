// Railway backend URL - always use external API
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://price-production-c1cb.up.railway.app";

export async function apiRequest<T = unknown>(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text;
    try {
      const json = JSON.parse(text);
      errorMessage = json.error || json.message || text;
    } catch {
      // Use text as-is
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const api = {
  // Auth endpoints
  getNonce: (walletAddress: string) =>
    apiRequest<{ message: string }>("POST", "/api/auth/phantom/nonce", { wallet_address: walletAddress }),
  
  verifySignature: (walletAddress: string, signature: string, name?: string, username?: string) =>
    apiRequest("POST", "/api/auth/phantom/verify", { 
      wallet_address: walletAddress, 
      signature,
      name,
      username 
    }),

  logout: () => apiRequest("POST", "/logout"),
  
  // User endpoints
  getProfile: () => apiRequest("GET", "/api/profile"),
  getUser: () => apiRequest("GET", "/api/user"),
  
  // Crypto endpoints
  getCurrentRound: (crypto: string) =>
    apiRequest("GET", `/api/rounds?crypto=${crypto}`),
  
  placeBet: (roundId: number, crypto: string, direction: string, amount: number) =>
    apiRequest("POST", "/api/bet", { round_id: roundId, crypto, direction, amount }),
  
  getLiveBets: (roundId: number, crypto: string) =>
    apiRequest("GET", `/api/live-bets?round_id=${roundId}&crypto=${crypto}`),
  
  // Stats & Leaderboard
  getMyStats: () => apiRequest("GET", "/api/my-stats"),
  getLeaderboard: (period: string = "daily") =>
    apiRequest("GET", `/api/leaderboard?period=${period}`),
  getRecentWinners: () => apiRequest("GET", "/api/recent-wins"),
  
  // On-chain endpoints
  getOnchainRound: (category: string) =>
    apiRequest("GET", `/api/onchain/rounds?category=${category}`),
  
  placeOnchainBet: (roundId: number, category: string, prediction: string, amount: number) =>
    apiRequest("POST", "/api/onchain/bet", { round_id: roundId, category, prediction, amount }),
  
  getOnchainBets: () => apiRequest("GET", "/api/onchain/my-bets"),
  
  // Custom bet endpoints
  createCustomBet: (tokenCa: string, duration: number) =>
    apiRequest("POST", "/api/custom-bet/create", { token_ca: tokenCa, duration }),
  
  getActiveCustomBets: () => apiRequest("GET", "/api/custom-bet/active"),
  
  getCustomBetDetails: (roundId: number) =>
    apiRequest("GET", `/api/custom-bet/${roundId}`),
  
  placeCustomBet: (roundId: number, prediction: string, amount: number) =>
    apiRequest("POST", "/api/custom-bet/place", { round_id: roundId, prediction, amount }),
  
  getUserCustomBets: () => apiRequest("GET", "/api/custom-bet/user-bets"),
  
  getCreatorEarnings: () => apiRequest("GET", "/api/custom-bet/creator-earnings"),
  
  getNotifications: () => apiRequest("GET", "/api/notifications"),
};
