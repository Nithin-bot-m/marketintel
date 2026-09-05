// Shared types for live market data — used by server routes and client components.

export interface LiveQuote {
  symbol: string; // display symbol e.g. "NIFTY 50" / "RELIANCE"
  name: string; // full name
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh?: number;
  dayLow?: number;
  asOf?: number; // regularMarketTime (ms)
}

export interface Ticker extends LiveQuote {
  trend: "up" | "down";
}

export interface MarketStatus {
  state: "open" | "closed" | "preopen";
  label: string; // "MARKET LIVE" / "MARKET CLOSED" / "PRE-OPEN"
  detail: string; // "Closes 3:30 PM IST" / "Opens Mon 9:15 AM IST"
  istTime: string; // "14:32:08"
  istDate: string; // "Fri, 4 Sep 2026"
}

export interface Mover {
  symbol: string;
  name: string;
  changePct: number;
  price: number;
}

export interface MarketSnapshot {
  ts: number;
  stale: boolean; // true when serving last-good cached payload
  status: MarketStatus;
  indices: LiveQuote[]; // NIFTY 50, SENSEX, NIFTY BANK, NIFTY IT
  vix: { price: number; changePct: number } | null;
  sectors: { symbol: string; label: string; price: number; changePct: number }[];
  tickers: Ticker[]; // ticker tape
  breadth: {
    advancers: number;
    decliners: number;
    unchanged: number;
    total: number;
    universe: string;
  } | null;
  movers: { gainers: Mover[]; losers: Mover[] } | null;
}

/** A single OHLC bar from the live feed (t = bar open time, ms epoch). */
export interface CandleBar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface CandlePayload {
  symbol: string;
  name: string;
  interval: string;
  prevClose: number;
  candles: CandleBar[];
  asOf: number;
  stale: boolean;
}
