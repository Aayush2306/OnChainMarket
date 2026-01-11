// CoinGecko price fetching service
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Map crypto symbols to CoinGecko IDs
const CRYPTO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  MATIC: "matic-network",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
};

export async function getCryptoPrice(symbol: string): Promise<number | null> {
  const coinId = CRYPTO_IDS[symbol.toUpperCase()];
  if (!coinId) return null;

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error("Failed to fetch crypto price:", error);
    return null;
  }
}

export async function getMultipleCryptoPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  const coinIds = symbols
    .map((s) => CRYPTO_IDS[s.toUpperCase()])
    .filter(Boolean);
  
  if (coinIds.length === 0) return {};

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinIds.join(",")}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    const result: Record<string, number> = {};

    for (const symbol of symbols) {
      const coinId = CRYPTO_IDS[symbol.toUpperCase()];
      if (coinId && data[coinId]?.usd) {
        result[symbol.toUpperCase()] = data[coinId].usd;
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch crypto prices:", error);
    return {};
  }
}

// DexScreener API for Solana token prices
export async function getSolanaTokenPrice(tokenAddress: string): Promise<{
  price: number | null;
  name: string | null;
  symbol: string | null;
  marketCap: number | null;
}> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );

    if (!response.ok) {
      return { price: null, name: null, symbol: null, marketCap: null };
    }

    const data = await response.json();
    const pair = data.pairs?.[0];

    if (!pair) {
      return { price: null, name: null, symbol: null, marketCap: null };
    }

    return {
      price: parseFloat(pair.priceUsd) || null,
      name: pair.baseToken?.name || null,
      symbol: pair.baseToken?.symbol || null,
      marketCap: parseFloat(pair.fdv) || null,
    };
  } catch (error) {
    console.error("Failed to fetch Solana token price:", error);
    return { price: null, name: null, symbol: null, marketCap: null };
  }
}
