// Shared types for live market data — used by server routes and client components.

export interface LiveQuote {
  symbol: string; // display symbol e.g. "XAU/USD" / "EUR/USD" / "GBP/USD"
  name: string; // full name e.g. "Gold / US Dollar"
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh?: number;
  dayLow?: number;
  bid?: number;
  ask?: number;
  precision?: number; // 2 for Gold/JPY, 4 for EUR/USD, etc.
  source?: string; // e.g. "OANDA", "COMEX"
  asOf?: number; // regularMarketTime (ms)
}

export interface Ticker extends LiveQuote {
  trend: "up" | "down";
}

export interface MarketStatus {
  state: "open" | "closed";
  label: string; // "LONDON · NY OVERLAP" / "ASIAN SESSION" / "WEEKEND CLOSE"
  detail: string; // "Peak interbank liquidity" / "Opens Sun 5:00 PM EST"
  activeSessions: string[]; // ["London", "New York"]
  gmtTime: string; // "14:32:08 GMT"
  gmtDate: string; // "Fri, 11 Sep 2026"
  sessionTime?: string; // friendly session clock
}

export interface Mover {
  symbol: string;
  name: string;
  changePct: number;
  price: number;
  precision?: number;
}

export interface EconomicEvent {
  title: string;
  country: string;
  currency: string;
  date: string; // ISO string
  impact: "High" | "Medium" | "Low";
  forecast: string;
  previous: string;
  actual?: string;
  note?: string;
}

export interface CurrencyStrength {
  currency: string;
  score: number;
  changePct: number;
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface MarketSnapshot {
  ts: number;
  stale: boolean; // true when serving last-good cached payload
  status: MarketStatus;
  indices: LiveQuote[]; // Majors: XAU/USD, EUR/USD, GBP/USD, USD/JPY
  dxy: { price: number; changePct: number } | null;
  vix: { price: number; changePct: number } | null;
  sectors: { symbol: string; label: string; price: number; changePct: number }[]; // Currency strength / Crosses
  tickers: Ticker[]; // ticker tape
  breadth: {
    advancers: number;
    decliners: number;
    unchanged: number;
    total: number;
    universe: string;
  } | null;
  movers: { gainers: Mover[]; losers: Mover[] } | null;
  calendar?: EconomicEvent[];
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

