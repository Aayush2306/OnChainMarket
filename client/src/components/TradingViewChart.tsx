import { useEffect, useRef } from "react";

interface TradingViewChartProps {
  symbol: string;
  type: "crypto" | "stock";
}

const cryptoSymbols: Record<string, string> = {
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  SOL: "BINANCE:SOLUSDT",
  BNB: "BINANCE:BNBUSDT",
  XRP: "BINANCE:XRPUSDT",
  ADA: "BINANCE:ADAUSDT",
  DOGE: "BINANCE:DOGEUSDT",
  MATIC: "BINANCE:MATICUSDT",
  DOT: "BINANCE:DOTUSDT",
  AVAX: "BINANCE:AVAXUSDT",
};

const stockSymbols: Record<string, string> = {
  AAPL: "NASDAQ:AAPL",
  GOOGL: "NASDAQ:GOOGL",
  TSLA: "NASDAQ:TSLA",
  MSFT: "NASDAQ:MSFT",
  AMZN: "NASDAQ:AMZN",
  META: "NASDAQ:META",
  NFLX: "NASDAQ:NFLX",
  NVDA: "NASDAQ:NVDA",
};

export function TradingViewChart({ symbol, type }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tvSymbol = type === "crypto" 
      ? cryptoSymbols[symbol] || `BINANCE:${symbol}USDT`
      : stockSymbols[symbol] || `NASDAQ:${symbol}`;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, type]);

  return (
    <div className="tradingview-widget-container h-[400px] w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget h-full w-full" />
    </div>
  );
}
