interface DexScreenerChartProps {
  tokenAddress: string;
}

export function DexScreenerChart({ tokenAddress }: DexScreenerChartProps) {
  const embedUrl = `https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden bg-background">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title="DexScreener Chart"
        allow="clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
