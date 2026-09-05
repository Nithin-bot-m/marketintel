// MarketIntel data layer — T1-sourced taxonomy from the ISD 4-Channel Content Plan.
// All figures are simulated demo values for illustration (SEBI-safe: informational only).

export type Trend = "up" | "down";

export interface IndexQuote {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: Trend;
  spark: number[];
}

export interface Ticker {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  trend: Trend;
}

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
}

export interface IPOItem {
  name: string;
  status: "LIVE" | "UPCOMING" | "LISTED";
  priceBand: string;
  lot: number;
  subscription: number; // x
  gmp: string;
  opens: string;
  closes?: string;
  listedAt?: string;
  listingGain?: number;
}

export interface FlowBar {
  month: string;
  fii: number;
  dii: number;
}

export interface MacroStat {
  label: string;
  value: string;
  sub: string;
  trend: Trend;
}

/* ------------------------------ Indices ------------------------------ */

export const INDICES: IndexQuote[] = [
  {
    symbol: "NIFTY 50",
    name: "NSE Benchmark",
    value: 24873.15,
    change: 142.4,
    changePct: 0.58,
    trend: "up",
    spark: [42, 45, 43, 48, 52, 50, 55, 53, 58, 61, 59, 64],
  },
  {
    symbol: "SENSEX",
    name: "BSE Benchmark",
    value: 81368.55,
    change: 486.12,
    changePct: 0.6,
    trend: "up",
    spark: [38, 42, 41, 45, 49, 47, 52, 56, 54, 59, 62, 66],
  },
  {
    symbol: "NIFTY BANK",
    name: "Banking Pack",
    value: 51284.3,
    change: -96.75,
    changePct: -0.19,
    trend: "down",
    spark: [58, 56, 60, 55, 52, 54, 49, 51, 47, 50, 46, 44],
  },
  {
    symbol: "NIFTY IT",
    name: "Tech Pack",
    value: 37912.6,
    change: 342.9,
    changePct: 0.91,
    trend: "up",
    spark: [30, 34, 33, 38, 42, 40, 46, 50, 49, 55, 58, 63],
  },
];

/* ------------------------------ Ticker tape ------------------------------ */

export const TICKER_BASE: Ticker[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2934.4, changePct: 1.24, trend: "up" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1712.85, changePct: 0.42, trend: "up" },
  { symbol: "TCS", name: "Tata Consultancy", price: 3956.1, changePct: -0.68, trend: "down" },
  { symbol: "INFY", name: "Infosys", price: 1849.75, changePct: 0.86, trend: "up" },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1274.3, changePct: -0.22, trend: "down" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1642.5, changePct: 1.58, trend: "up" },
  { symbol: "ITC", name: "ITC Ltd", price: 438.9, changePct: -0.35, trend: "down" },
  { symbol: "LT", name: "Larsen & Toubro", price: 3618.2, changePct: 0.94, trend: "up" },
  { symbol: "SBIN", name: "State Bank of India", price: 842.15, changePct: 2.1, trend: "up" },
  { symbol: "ADANIENT", name: "Adani Enterprises", price: 2988.6, changePct: -1.42, trend: "down" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 968.45, changePct: 1.05, trend: "up" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 12412.8, changePct: -0.51, trend: "down" },
  { symbol: "ASIANPAINT", name: "Asian Paints", price: 2876.35, changePct: 0.29, trend: "up" },
  { symbol: "WIPRO", name: "Wipro", price: 542.7, changePct: -0.83, trend: "down" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2465.9, changePct: 0.37, trend: "up" },
  { symbol: "AXISBANK", name: "Axis Bank", price: 1148.2, changePct: -0.44, trend: "down" },
  { symbol: "US Dollar / INR", name: "USDINR", price: 84.12, changePct: 0.08, trend: "up" },
  { symbol: "Gold (10g)", name: "MCX Gold", price: 74210, changePct: 0.62, trend: "up" },
  { symbol: "Brent Crude (bbl)", name: "Brent", price: 78.94, changePct: -1.15, trend: "down" },
  { symbol: "India VIX", name: "Volatility Index", price: 13.42, changePct: -2.8, trend: "down" },
];

/* ------------------------------ Intel feed ------------------------------ */

export const INTEL_FEED: IntelArticle[] = [
  {
    slug: "sebi-new-ipo-disclosure-framework",
    category: "SEBI Circular",
    title: "SEBI tightens IPO disclosure norms — anchor lock-in extended to 90 days for SME issues",
    summary:
      "The board-approved amendments mandate expanded risk-factor disclosure and a longer anchor investor lock-in for SME listings. We decode what changes for issuers, merchants bankers and retail allocation in our plain-language breakdown of the circular.",
    source: "SEBI",
    sourceTier: "T1",
    publishedAt: "28 min ago",
    readMins: 6,
    accent: "gold",
  },
  {
    slug: "rbi-policy-statement-inflation-corridor",
    category: "Macro / RBI",
    title: "RBI holds repo at 6.50%, flags food inflation trajectory as key risk to Q3 corridor",
    summary:
      "The Monetary Policy Committee keeps the stance neutral with a 4:2 vote. Governor's statement signals data dependence into the December review. We map the dot in the inflation corridor against core CPI prints and the PIB economy brief.",
    source: "RBI",
    sourceTier: "T1",
    publishedAt: "1 hr ago",
    readMins: 8,
    accent: "violet",
  },
  {
    slug: "fii-dii-flows-november-trend",
    category: "FII / DII",
    title: "FIIs turn net buyers after 3 weeks — ₹4,812 cr inflow; DIIs extend streak to 14 sessions",
    summary:
      "Provisional exchange data shows foreign institutions rotating into large-cap banks and IT while domestic institutions continue systematic-inflow-driven buying. Full daily flow table with sector-wise provisional breakdown inside.",
    source: "NSE · BSE",
    sourceTier: "T1",
    publishedAt: "2 hrs ago",
    readMins: 4,
    accent: "emerald",
  },
  {
    slug: "q2-results-it-cadence",
    category: "Quarterly Results",
    title: "Q2 scorecard: IT majors beat on margins but trim CC guidance; BFSI deal ramps stay muted",
    summary:
      "Cross-channel results tracker with EBITDA margin bridges, constant-currency growth and management commentaries distilled from exchange filings. Our standardised result-cards make quarter-on-quarter comparisons one-glance simple.",
    source: "NSE Filings",
    sourceTier: "T1",
    publishedAt: "4 hrs ago",
    readMins: 9,
    accent: "gold",
  },
  {
    slug: "pib-capex-pulse-infrastructure",
    category: "Macro / PIB",
    title: "Centre's capex pulse: infra outlay pacing 11% higher YoY, roads and rails lead the charge",
    summary:
      "Parsing the latest PIB economy release — ministry-wise capex achievement vs budget estimates, GBS utilisation and what the pace means for cement, steel and capital-goods order books heading into H2.",
    source: "PIB",
    sourceTier: "T1",
    publishedAt: "6 hrs ago",
    readMins: 7,
    accent: "violet",
  },
  {
    slug: "explainer-ipo-grading-gmp",
    category: "Explainer",
    title: "IPO grading, GMP and the grey market: what retail investors often misread",
    summary:
      "An evergreen explainer separating signal from noise — how grey-market premiums form, why SEBI doesn't regulate them, and a framework to read subscription numbers without falling for anchoring bias. Educational only, no recommendations.",
    source: "MarketIntel Research",
    sourceTier: "T2",
    publishedAt: "Yesterday",
    readMins: 11,
    accent: "emerald",
  },
];

/* ------------------------------ IPO tracker ------------------------------ */

export const IPOS: IPOItem[] = [
  {
    name: "Premier E-Solutions Ltd",
    status: "LIVE",
    priceBand: "₹418 – ₹440",
    lot: 34,
    subscription: 8.42,
    gmp: "₹96",
    opens: "Sep 02",
    closes: "Sep 04",
  },
  {
    name: "Bharat Cold Logistics IPO",
    status: "LIVE",
    priceBand: "₹296 – ₹312",
    lot: 48,
    subscription: 3.17,
    gmp: "₹41",
    opens: "Sep 03",
    closes: "Sep 05",
  },
  {
    name: "Nyara Retail Ltd",
    status: "UPCOMING",
    priceBand: "₹1,050 – ₹1,105",
    lot: 13,
    subscription: 0,
    gmp: "—",
    opens: "Sep 09",
  },
  {
    name: "Veda Pharma Works",
    status: "UPCOMING",
    priceBand: "₹528 – ₹556",
    lot: 27,
    subscription: 0,
    gmp: "—",
    opens: "Sep 11",
  },
  {
    name: "Orbital Renewables",
    status: "LISTED",
    priceBand: "₹724 – ₹761",
    lot: 19,
    subscription: 24.68,
    gmp: "₹128",
    opens: "Aug 26",
    closes: "Aug 28",
    listedAt: "Sep 01",
    listingGain: 18.4,
  },
  {
    name: "Kavya Finserv",
    status: "LISTED",
    priceBand: "₹158 – ₹166",
    lot: 90,
    subscription: 41.2,
    gmp: "₹22",
    opens: "Aug 19",
    closes: "Aug 21",
    listedAt: "Aug 26",
    listingGain: -2.6,
  },
];

/* ------------------------------ FII / DII flows ------------------------------ */

export const FLOWS: FlowBar[] = [
  { month: "Mar", fii: 8452, dii: 11220 },
  { month: "Apr", fii: -6214, dii: 14890 },
  { month: "May", fii: 12708, dii: 9046 },
  { month: "Jun", fii: -4318, dii: 16452 },
  { month: "Jul", fii: 5912, dii: 13118 },
  { month: "Aug", fii: -2186, dii: 17864 },
  { month: "Sep", fii: 4812, dii: 12048 },
];

export const MACRO: MacroStat[] = [
  { label: "Repo Rate", value: "6.50%", sub: "MPC · unchanged", trend: "up" },
  { label: "CPI Inflation", value: "3.54%", sub: "Aug print · easing", trend: "down" },
  { label: "GST Collections", value: "₹1.82L Cr", sub: "Aug · +10.2% YoY", trend: "up" },
  { label: "FX Reserves", value: "$704.2B", sub: "RBI weekly · record", trend: "up" },
];

/* ------------------------------ Network (from PDF) ------------------------------ */

export const NETWORK = [
  { name: "EduIntel", desc: "Education intelligence", vertical: "Education", live: false },
  { name: "MarketIntel", desc: "Share market intelligence", vertical: "Share Market", live: true },
  { name: "AIIntel", desc: "AI trends intelligence", vertical: "AI Trends", live: false },
  { name: "GrowthIntel", desc: "Digital marketing intelligence", vertical: "Digital Marketing", live: false },
];

export const CATEGORIES = [
  { name: "Market Wrap", count: "Daily · 4:30 PM", desc: "End-of-day recap across cash & F&O" },
  { name: "IPOs", count: "Live tracker", desc: "Bands, subscription, GMP & listings" },
  { name: "Quarterly Results", count: "Season tracker", desc: "Standardised result cards & bridges" },
  { name: "FII / DII", count: "EOD flows", desc: "Provisional daily institutional flows" },
  { name: "Macro", count: "Event-driven", desc: "RBI, PIB, MOSPI decoded" },
  { name: "Explainers", count: "Evergreen", desc: "Concepts that compound your base" },
];

/* helpers */
export function formatINR(n: number, decimals = 2): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCr(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "+";
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L Cr`;
  return `${sign}₹${abs.toLocaleString("en-IN")} Cr`;
}

/** Random-walk a quote by a small % — used to simulate live movement. */
export function walkTicker(t: Ticker, volatility = 0.0012): Ticker {
  const drift = (Math.random() - 0.48) * 2 * volatility;
  const newPrice = Math.max(0.05, t.price * (1 + drift));
  const newPct = t.changePct + drift * 100;
  return {
    ...t,
    price: newPrice,
    changePct: newPct,
    trend: newPct >= 0 ? "up" : "down",
  };
}
