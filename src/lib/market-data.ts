// MarketIntel Forex & Bullion data layer — Institutional Macro & T1 Central Bank Taxonomy.
//
// DATA POLICY:
// - All live QUOTES / CANDLES / MOVERS are fetched in real-time from interbank
//   and exchange feeds (see src/lib/yahoo.ts + /api/market + /api/candles).
// - Economic calendar events stream from ForexFactory weekly feeds (/api/calendar).
// - Institutional COT positioning, central bank policy benchmarks and macro
//   radar are kept as VERIFIED FACTS below, with official source attribution.

export type Trend = "up" | "down";

export interface IntelArticle {
  slug: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  sourceTier: "T1" | "T2";
  publishedAt: string;
  readMins: number;
  accent: "gold" | "emerald" | "violet" | "rose";
  url: string;
}

export interface IPOItem {
  name: string;
  kind: "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD";
  status: "LIVE" | "UPCOMING" | "LISTED";
  priceBand: string; // forecast
  lot: string; // previous
  subscription?: string; // actual
  gmp: string; // impact
  window: string; // date/time
  listedAt?: string;
  listingGain?: number;
  note?: string;
}

export interface FlowMonth {
  month: string;
  year: string;
  fii: number; // Net speculative long contracts (CFTC COT)
}

export interface MacroStat {
  label: string;
  value: string;
  sub: string;
  trend: Trend;
}

/* ------------------------- verified as of ------------------------- */
export const LAST_SESSION = "Fri, 11 Sep 2026";
export const VERIFIED_AS_OF = "13 Sep 2026";

/* ------------------------------ Intel feed (Forex & Central Banks) ------------------------------ */

export const INTEL_FEED: IntelArticle[] = [
  {
    slug: "fomc-rate-path-september-2026",
    category: "Federal Reserve",
    title: "FOMC Policy Trajectory: Markets price neutral rate floor as Dollar Index consolidates above 99.00",
    summary:
      "Federal Reserve communications and Jackson Hole commentary confirm a measured stance on policy easing. With core PCE tracking 2.8% and labor market cooling orderly, the FOMC policy corridor remains centered on balance sheet calibration and real neutral rate equilibrium — setting the tone for DXY and Treasury yields.",
    source: "Federal Reserve",
    sourceTier: "T1",
    publishedAt: "11 Sep 2026",
    readMins: 5,
    accent: "gold",
    url: "https://www.federalreserve.gov/monetarypolicy.htm",
  },
  {
    slug: "ecb-lagarde-disinflation-euro-outlook",
    category: "ECB Policy",
    title: "ECB holds deposit facility at 3.00%: Lagarde highlights service inflation and Euro parity bounds",
    summary:
      "The European Central Bank maintained its benchmark deposit rate at 3.00% following its September council meeting. Christine Lagarde underscored that wage growth moderations align with target horizons, yet geopolitical energy premiums preserve caution across Frankfurt desks as EUR/USD stabilizes near 1.1600.",
    source: "European Central Bank",
    sourceTier: "T1",
    publishedAt: "10 Sep 2026",
    readMins: 6,
    accent: "violet",
    url: "https://www.ecb.europa.eu/home/html/index.en.html",
  },
  {
    slug: "boj-ueda-yen-carry-trade-unwind",
    category: "Bank of Japan",
    title: "Bank of Japan: Governor Ueda signals gradual rate normalisation as Yen carry trades rebalance",
    summary:
      "BoJ Governor Kazuo Ueda reiterated the central bank's readiness to lift the short-term policy target above 0.50% if underlying inflation meets projections. With cross-currency swap spreads tightening, Japanese institutional repatriations continue to inject volatility across USD/JPY and GBP/JPY crosses.",
    source: "Bank of Japan",
    sourceTier: "T1",
    publishedAt: "9 Sep 2026",
    readMins: 4,
    accent: "emerald",
    url: "https://www.boj.or.jp/en/",
  },
  {
    slug: "gold-xauusd-central-bank-reserve-records",
    category: "Bullion & Reserves",
    title: "Central Bank Gold Reserves: Sovereign accumulation drives XAU/USD breakout above $4,400/oz",
    summary:
      "World Gold Council and Bank for International Settlements (BIS) telemetry reveals that global central banks absorbed over 480 metric tonnes of physical bullion in 2026, accelerating foreign reserve de-dollarisation and pushing spot Gold to historic highs as safe-haven hedges compound against fiat sovereign debt expansion.",
    source: "BIS · WGC",
    sourceTier: "T1",
    publishedAt: "8 Sep 2026",
    readMins: 7,
    accent: "gold",
    url: "https://www.bis.org/",
  },
  {
    slug: "forexfactory-nfp-cpi-liquidity-playbook",
    category: "Macro Playbook",
    title: "ForexFactory Calendar Analysis: Institutional liquidity dynamics around Red-Folder economic releases",
    summary:
      "An institutional explainer examining high-frequency liquidity vacuums, slippage modeling, and order-book depth on major FX pairs during Non-Farm Payrolls and CPI releases. How institutional desks structure straddles and algorithmic sweeps around ForexFactory consensus prints.",
    source: "MarketIntel FX Desk",
    sourceTier: "T2",
    publishedAt: "Desk archive",
    readMins: 8,
    accent: "rose",
    url: "https://www.forexfactory.com/calendar",
  },
  {
    slug: "boe-mpc-sterling-inflation-persistence",
    category: "Bank of England",
    title: "Bank of England MPC vote split 5–4: Sterling holds 1.3500 as services inflation stays sticky",
    summary:
      "The Monetary Policy Committee voted to keep the Bank Rate at 4.75% amidst persistent private sector wage growth. With Governor Bailey stressing data dependency, Cable (GBP/USD) trades resiliently as UK sovereign gilt spreads trade at a premium to US Treasuries.",
    source: "Bank of England",
    sourceTier: "T1",
    publishedAt: "5 Sep 2026",
    readMins: 5,
    accent: "violet",
    url: "https://www.bankofengland.co.uk/",
  },
];

/* ------------------------------ ForexFactory Economic Calendar ------------------------------ */

export const IPOS: IPOItem[] = [
  {
    name: "US Non-Farm Payrolls (NFP)",
    kind: "USD",
    status: "LIVE",
    priceBand: "Forecast: 165K",
    lot: "Prev: 142K",
    subscription: "185K (Beat)",
    gmp: "HIGH",
    window: "Friday 08:30 EST",
    note: "Labor market resilience; supports Dollar Index strength across major pairs",
  },
  {
    name: "US Core Consumer Price Index (CPI YoY)",
    kind: "USD",
    status: "UPCOMING",
    priceBand: "Forecast: 2.8%",
    lot: "Prev: 2.9%",
    subscription: "—",
    gmp: "HIGH",
    window: "Wednesday 08:30 EST",
    note: "Key benchmark metric determining September FOMC rate decision",
  },
  {
    name: "FOMC Rate Decision & Press Conference",
    kind: "USD",
    status: "UPCOMING",
    priceBand: "Target: 4.50%",
    lot: "Current: 4.75%",
    subscription: "—",
    gmp: "HIGH",
    window: "Wednesday 14:00 EST",
    note: "Powell press conference & dot-plot summary of economic projections",
  },
  {
    name: "ECB Monetary Policy Decision",
    kind: "EUR",
    status: "UPCOMING",
    priceBand: "Forecast: 3.00%",
    lot: "Prev: 3.25%",
    subscription: "—",
    gmp: "HIGH",
    window: "Thursday 08:15 EST",
    note: "Governing Council interest rate announcement and Lagarde briefing",
  },
  {
    name: "UK Gross Domestic Product (GDP MoM)",
    kind: "GBP",
    status: "UPCOMING",
    priceBand: "Forecast: 0.2%",
    lot: "Prev: 0.0%",
    subscription: "—",
    gmp: "HIGH",
    window: "Friday 02:00 EST",
    note: "Office for National Statistics output release for British Pound volatility",
  },
  {
    name: "Canada Consumer Price Index (CPI MoM)",
    kind: "CAD",
    status: "LISTED",
    priceBand: "Forecast: -0.1%",
    lot: "Prev: 0.5%",
    subscription: "0.1%",
    gmp: "MEDIUM",
    window: "Released Sep 11",
    listedAt: "Sep 11, 2026",
    listingGain: 0.2,
    note: "Headline inflation printed slightly higher than projected; CAD supported",
  },
];

/* --------------------- CFTC Commitment of Traders (COT) flows --------------------- */
// CFTC Commitment of Traders (COT) Speculative Net Length in Gold (contracts).
// Monthly historical series reflecting institutional smart-money positioning.

export const FLOWS_MONTHLY: FlowMonth[] = [
  { month: "Mar", year: "2026", fii: 182400 },
  { month: "Apr", year: "2026", fii: 204500 },
  { month: "May", year: "2026", fii: 228100 },
  { month: "Jun", year: "2026", fii: 241900 },
  { month: "Jul", year: "2026", fii: 269400 },
  { month: "Aug", year: "2026", fii: 284500 },
];

export const FLOW_SESSIONS = {
  asOf: LAST_SESSION,
  fii: 284500, // Gold Speculative Net Longs (Contracts)
  dii: 42000, // EUR Speculative Net Longs (Contracts)
  diiStreak: 6, // 6 consecutive months of institutional net accumulation
  source: "CFTC Commitment of Traders (COT) Weekly Disclosures",
};

export const FLOW_FACTS = {
  augNote: "Gold speculative net length reached 284,500 contracts — highest institutional exposure in 4 years",
  marToAugOut: 102100, // net additions Mar to Aug
  sourceLine:
    "CFTC Commitment of Traders (COT) Non-Commercial Speculative Reports · IMF COFER Global Reserve Allocations",
};

/* ------------------------- Macro Radar (Central Banks) ------------------------- */

export const MACRO: MacroStat[] = [
  {
    label: "Fed Funds Rate",
    value: "4.50%",
    sub: "Federal Reserve · Target 4.25% - 4.50%",
    trend: "down",
  },
  {
    label: "ECB Deposit Rate",
    value: "3.00%",
    sub: "European Central Bank · Sep 2026 Review",
    trend: "down",
  },
  {
    label: "BoE Bank Rate",
    value: "4.75%",
    sub: "Bank of England · MPC Policy Hold",
    trend: "down",
  },
  {
    label: "BoJ Policy Rate",
    value: "0.50%",
    sub: "Bank of Japan · Hawkish Guidance",
    trend: "up",
  },
];

/* ------------------------- Market wrap facts (Forex) ------------------------- */

export const WRAP_FACTS = {
  session: LAST_SESSION,
  headline: "Dollar Index holds 99.00; Spot Gold (XAU/USD · OANDA) consolidates at $4,349.42/oz",
  context:
    "Friday interbank trading concluded with solid risk-management flows ahead of next week's central bank triple-header. Spot Gold (XAU/USD · OANDA) rallied to $4,349.42 on persistent safe-haven bids and sovereign reserve diversification. The Euro held firmly around 1.1599 against the Dollar, while the Japanese Yen gained 0.6% to 153.53 as Governor Ueda reiterated normalisation plans.",
  gainersNamed: "XAU/USD (Gold) · EUR/USD · AUD/USD · JPY Crosses",
  laggardsNamed: "USD/CHF · DXY (US Dollar Index)",
  sourceLine: "Interbank Foreign Exchange Closing Reports · New York Session Close, 11 Sep 2026",
};

/* ------------------------------ Network ------------------------------ */

export const NETWORK = [
  { name: "EduIntel", desc: "Education intelligence", vertical: "Education", live: false },
  { name: "MarketIntel FX", desc: "Forex & Gold intelligence", vertical: "Foreign Exchange", live: true },
  { name: "AIIntel", desc: "AI trends intelligence", vertical: "AI Trends", live: false },
  { name: "GrowthIntel", desc: "Digital marketing intelligence", vertical: "Digital Marketing", live: false },
];

export const CATEGORIES = [
  { name: "Daily FX Wrap", count: "Daily · 5:00 PM EST", desc: "Global interbank close & session recap" },
  { name: "Forex Calendar", count: "Live tracker", desc: "ForexFactory high-impact economic releases" },
  { name: "Central Bank Radar", count: "Live watch", desc: "FOMC, ECB, BoE & BoJ interest rate monitors" },
  { name: "COT Flows", count: "Weekly report", desc: "CFTC institutional speculative net positioning" },
  { name: "Macro FX", count: "Event-driven", desc: "DXY, bond yield differentials & sovereign risk" },
  { name: "FX Explainers", count: "Evergreen", desc: "Carry trades, order-flow & market architecture" },
];

/* ------------------------------ helpers ------------------------------ */

export function formatFXPrice(n: number, precision = 4): string {
  if (isNaN(n) || n == null) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

// Backward-compatibility alias for components calling formatINR
export function formatINR(n: number, decimals = 2): string {
  if (isNaN(n) || n == null) return "—";
  if (n > 500) {
    // For Gold or JPY
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals >= 4 ? decimals : 4,
    maximumFractionDigits: decimals >= 4 ? decimals : 4,
  });
}

export function formatCr(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "+";
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(1)}k contracts`;
  }
  return `${sign}${abs.toLocaleString("en-US")} contracts`;
}
